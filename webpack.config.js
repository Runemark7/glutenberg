/**
 * External dependencies
 */
const { resolve } = require('path');

// gutenberg-js
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('./static/css/style.css');
const extractBLCSS = new ExtractTextPlugin('./static/css/block-library/style.css');
const CleanWebpackPlugin = require('clean-webpack-plugin');


// g-editor 
const path = require('path');
const webpack = require('webpack');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent');
const getClientEnvironment = require('./config/env');
const paths = require('./config/paths');
const ManifestPlugin = require('webpack-manifest-plugin');
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin');
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const PhpOutputPlugin = require('webpack-php-manifest');


const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const safePostCssParser = require('postcss-safe-parser');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const WorkboxWebpackPlugin = require('workbox-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');


//const PostCssWrapper = require('postcss-wrapper-loader');
//const StringReplacePlugin = require('string-replace-webpack-plugin');

//BLock dir
const blockDir = process.env.BLOCK_DIR ? process.env.BLOCK_DIR + '/' : '';
const blockVars = {};



if (blockDir) {
    const fs = require('fs');
    if (fs.lstatSync(blockDir).isDirectory()) {
        const script = `${blockDir}build/index.js`;
        const style  = `${blockDir}build/style.css`;
        const editor = `${blockDir}build/editor.css`;

        if (fs.existsSync(script) && fs.lstatSync(script).isFile()) {
            blockVars.blockScript = fs.readFileSync(script).toString();
        }

        if (fs.existsSync(style) && fs.lstatSync(style).isFile()) {
            blockVars.blockStyle = fs.readFileSync(style).toString();
        }

        if (fs.existsSync(editor) && fs.lstatSync(editor).isFile()) {
            blockVars.blockEditorStyle = fs.readFileSync(editor).toString();
        }
    }
}
const publicPath = paths.servedPath;
const shouldUseRelativeAssetPaths = publicPath === './';
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
const shouldInlineRuntimeChunk = process.env.INLINE_RUNTIME_CHUNK !== 'false';
const publicUrl = publicPath.slice(0, -1);
const env = getClientEnvironment(publicUrl);

function camelCaseDash (string) {
    return string.replace(
      /-([a-z])/g,
      (match, letter) => letter.toUpperCase()
    );
}

const babelLoader = {
    loader: 'babel-loader',
    options: {
      presets: ["@babel/preset-env", "@babel/preset-react"],
    },
};
  
const externals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    moment: 'moment',
    jquery: 'jQuery',
};


[
  'api-fetch',
  'url',
].forEach(name => {
  externals[ `@wordpress/${name}` ] = {
    this: [ 'wp', camelCaseDash(name) ],
  };
});

module.exports = {
    mode: 'production',
    bail:true,
    devtool:  'source-map',
    entry: {app: paths.appIndexJs, style:paths.appIndexScss, block: paths.appBlockScss},
    output: {
      path: paths.appBuild,
      filename: 'static/js/[name].[hash:8].js',
      chunkFilename: 'static/js/[name].[hash:8].chunk.js',
      publicPath: publicPath,
      devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),
      libraryTarget:'this'
    },
    optimization: {
      minimizer: [
    
      ],
      splitChunks: {
        chunks: 'all',
        name: false,
      },
      runtimeChunk: true,
    },
    resolve: {
      modules: ['node_modules'].concat(
        process.env.NODE_PATH.split(path.delimiter).filter(Boolean)
      ),
      extensions: ['.mjs', '.web.js', '.js', '.json', '.web.jsx', '.jsx'],
      plugins: [
        PnpWebpackPlugin,
        new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson]),
      ],
      alias: {
        'react-native': 'react-native-web',
      },
    },
    resolveLoader: {
      plugins: [
        PnpWebpackPlugin.moduleLoader(module),
      ],
    },
    externals,
    module: {
      rules:[
        { parser: { requireEnsure: false } },
        {
          loader: require.resolve('file-loader'),
          exclude: [/\.(js|mjs|jsx)$/, /\.html$/, /\.json$/, /\.scss$/, /\.css$/], 
          options: {
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
        {
          oneOf: [
            {
              test: /\.js$/,
              include: [
                /src/,
                /node_modules\/@wordpress/,
              ],
              use: babelLoader,
            },
            {
            test: /\.js$/,
            oneOf: [
              {
                resourceQuery: /\?source=node_modules/,
                use: babelLoader,
              },
              {
                loader: 'path-replace-loader',
                options: {
                  path: resolve(__dirname, 'node_modules/@wordpress'),
                  replacePath: resolve(__dirname, 'src/gutenberg-overrides/@wordpress'),
                }, 
              },
            ],
          },
          {
            test: /style\.s?css$/,
            use: extractCSS.extract({
              fallback: 'style-loader', // creates style nodes from JS strings
              use: [
                { loader: 'css-loader' },   // translates CSS into CommonJS
                { loader: 'sass-loader' },  // compiles Sass to CSS
              ],
            }),
          },
          {
            test: /block-library\.s?css$/,
            use: extractBLCSS.extract({
              fallback: 'style-loader', // creates style nodes from JS strings
              use: [
                { loader: 'css-loader' },   // translates CSS into CommonJS
                { loader: 'sass-loader' },  // compiles Sass to CSS
              ],
            }),
          },
          ]
        }
      ]
    },
    plugins: [
      extractCSS,
      extractBLCSS,
      new CleanWebpackPlugin(['build']),
      new HtmlWebpackPlugin({
        inject: true,
        filename: 'index.php',
        template: paths.appHtml,
        ...blockVars,
        minify: {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true,
        },
      }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
        PUBLIC_URL: publicUrl
    }),
    new webpack.DefinePlugin(env.stringified),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: publicPath,
    }),
    ],
    stats: {
      children: false,
    },
};
