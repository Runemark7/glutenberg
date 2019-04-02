/**
 * External dependencies
 */
const { resolve } = require('path');

// gutenberg-js
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('./css/style.css');
const extractBLCSS = new ExtractTextPlugin('./css/block-library/style.css');
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
        const phpContent = `${blockDir}build/index.php`;

        if (fs.existsSync(script) && fs.lstatSync(script).isFile()) {
            blockVars.blockScript = fs.readFileSync(script).toString();
        }

        if (fs.existsSync(style) && fs.lstatSync(style).isFile()) {
            blockVars.blockStyle = fs.readFileSync(style).toString();
        }

        if (fs.existsSync(editor) && fs.lstatSync(editor).isFile()) {
            blockVars.blockEditorStyle = fs.readFileSync(editor).toString();
        }

        if (fs.existsSync(phpContent) && fs.lstatSync(phpContent).isFile()) {
            blockVars.phpContent = fs.readFileSync(phpContent).toString();
        }
    }
}
const publicPath = '/';
const publicUrl = '';
const env = getClientEnvironment(publicUrl);

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

const getStyleLoaders = (cssOptions, preProcessor) => {
    const loaders = [
      require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: require.resolve('postcss-loader'),
        options: {
          // Necessary for external CSS imports to work
          // https://github.com/facebook/create-react-app/issues/2677
          ident: 'postcss',
          plugins: () => [
            require('postcss-flexbugs-fixes'),
            require('postcss-preset-env')({
              autoprefixer: {
                flexbox: 'no-2009',
              },
              stage: 3,
            }),
          ],
        },
      },
    ];
    if (preProcessor) {
      loaders.push(require.resolve(preProcessor));
    }
    return loaders;
  };

function camelCaseDash (string) {
    return string.replace(
      /-([a-z])/g,
      (match, letter) => letter.toUpperCase()
    );
}

const babelLoader = {
    loader: 'babel-loader',
    options: {
      presets: ['@babel/preset-react'],
    },
};
  
const externals = {
    react: 'React',
    'react-dom': 'ReactDOM',
    moment: 'moment',
    jquery: 'jQuery',
};
  
const alias = {'react-native': 'react-native-web'};

[
    'api-fetch',
    'url',
  ].forEach(name => {
    externals[ `@wordpress/${name}` ] = {
      this: [ 'wp', camelCaseDash(name) ],
    };
  });

module.exports = {
    mode: 'development',
    devtool:  'source-map'/*['source-map', 'chaep-module-source-map']*/,
    entry: './src/index.js',
    output: {
      filename: 'js/gutenberg-js.js',
      path: resolve(__dirname, 'build'),
      libraryTarget: 'this',
    },
    externals,
    resolve: {
      modules: [
        __dirname,
        resolve(__dirname, 'node_modules'),
      ],
      alias,
      extensions: ['.mjs', '.web.js', '.js', '.json', '.web.jsx', '.jsx'],
    },
    module: {
        strictExportPresence: true,
      rules: [
        { parser: { requireEnsure: false } },
        {
          test: /\.js$/,
          include: [
            /src/,
            /node_modules\/@wordpress/,
          ],
          use: babelLoader,
        },    {
            // "oneOf" will traverse all following loaders until one will
            // match the requirements. When no loader matches it will fall
            // back to the "file" loader at the end of the loader list.
            oneOf: [
              // "url" loader works like "file" loader except that it embeds assets
              // smaller than specified limit in bytes as data URLs to avoid requests.
              // A missing `test` is equivalent to a match.
              {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: require.resolve('url-loader'),
                options: {
                  limit: 10000,
                  name: 'static/media/[name].[hash:8].[ext]',
                },
              },
              // Process application JS with Babel.
              // The preset includes JSX, Flow, and some ESnext features.
              {
                test: /\.(js|mjs|jsx)$/,
                include: paths.appSrc,
                loader: require.resolve('babel-loader'),
                options: {
                  customize: require.resolve(
                    'babel-preset-react-app/webpack-overrides'
                  ),
    
                  plugins: [
                    [
                      require.resolve('babel-plugin-named-asset-import'),
                      {
                        loaderMap: {
                          svg: {
                            ReactComponent: '@svgr/webpack?-prettier,-svgo![path]',
                          },
                        },
                      },
                    ],
                  ],
                  // This is a feature of `babel-loader` for webpack (not Babel itself).
                  // It enables caching results in ./node_modules/.cache/babel-loader/
                  // directory for faster rebuilds.
                  cacheDirectory: true,
                  // Don't waste time on Gzipping the cache
                  cacheCompression: false,
                },
              },
              // Process any JS outside of the app with Babel.
              // Unlike the application JS, we only compile the standard ES features.
              {
                test: /\.(js|mjs)$/,
                exclude: /@babel(?:\/|\\{1,2})runtime/,
                loader: require.resolve('babel-loader'),
                options: {
                  babelrc: false,
                  configFile: false,
                  compact: false,
                  presets: [
                    [
                      require.resolve('babel-preset-react-app/dependencies'),
                      { helpers: true },
                    ],
                  ],
                  cacheDirectory: true,
                  // Don't waste time on Gzipping the cache
                  cacheCompression: false,
    
                  // If an error happens in a package, it's possible to be
                  // because it was compiled. Thus, we don't want the browser
                  // debugger to show the original code. Instead, the code
                  // being evaluated would be much more helpful.
                  sourceMaps: false,
                },
              },
              // "postcss" loader applies autoprefixer to our CSS.
              // "css" loader resolves paths in CSS and adds assets as dependencies.
              // "style" loader turns CSS into JS modules that inject <style> tags.
              // In production, we use a plugin to extract that CSS to a file, but
              // in development "style" loader enables hot editing of CSS.
              // By default we support CSS Modules with the extension .module.css
              {
                test: cssRegex,
                exclude: cssModuleRegex,
                use: getStyleLoaders({
                  importLoaders: 1,
                }),
              },
              // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
              // using the extension .module.css
              {
                test: cssModuleRegex,
                use: getStyleLoaders({
                  importLoaders: 1,
                  modules: true,
                  getLocalIdent: getCSSModuleLocalIdent,
                }),
              },
              // Opt-in support for SASS (using .scss or .sass extensions).
              // Chains the sass-loader with the css-loader and the style-loader
              // to immediately apply all styles to the DOM.
              // By default we support SASS Modules with the
              // extensions .module.scss or .module.sass
              {
                test: sassRegex,
                exclude: sassModuleRegex,
                use: getStyleLoaders({ importLoaders: 2 }, 'sass-loader'),
              },
              // Adds support for CSS Modules, but using SASS
              // using the extension .module.scss or .module.sass
              {
                test: sassModuleRegex,
                use: getStyleLoaders(
                  {
                    importLoaders: 2,
                    modules: true,
                    getLocalIdent: getCSSModuleLocalIdent,
                  },
                  'sass-loader'
                ),
              },
              // "file" loader makes sure those assets get served by WebpackDevServer.
              // When you `import` an asset, you get its (virtual) filename.
              // In production, they would get copied to the `build` folder.
              // This loader doesn't use a "test" so it will catch all modules
              // that fall through the other loaders.
              {
                // Exclude `js` files to keep "css" loader working as it injects
                // its runtime that would otherwise be processed through "file" loader.
                // Also exclude `html` and `json` extensions so they get processed
                // by webpacks internal loaders.
                exclude: [/\.(js|mjs|jsx)$/, /\.html$/, /\.json$/],
                loader: require.resolve('file-loader'),
                options: {
                  name: 'static/media/[name].[hash:8].[ext]',
                },
              },
            ],
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
      ],
    },
    plugins: [
        PnpWebpackPlugin,
      extractCSS,
      extractBLCSS,
      // wrapping editor style with .gutenberg__editor class
      // new PostCssWrapper('./css/block-library/edit-blocks.css', '.gutenberg__editor'),
      // new StringReplacePlugin(),
      new CleanWebpackPlugin(['build']),
      new HtmlWebpackPlugin({
        inject: true,
        entry: 'src/index.js',
        filename: 'index.php',
        template: paths.appHtml,
        ...blockVars,
      }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin, {
        PUBLIC_URL: publicUrl
    }),
    // This gives some necessary context to module not found errors, such as
    // the requesting resource.
    new ModuleNotFoundPlugin(paths.appPath),
    // Makes some environment variables available to the JS code, for example:
    // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
    new webpack.DefinePlugin(env.stringified),
    // This is necessary to emit hot updates (currently CSS only):
    new webpack.HotModuleReplacementPlugin(),
    // Watcher doesn't work well if you mistype casing in a path so we use
    // a plugin that prints an error when you attempt to do this.
    // See https://github.com/facebook/create-react-app/issues/240
    new CaseSensitivePathsPlugin(),
    // If you require a missing module and then `npm install` it, you still have
    // to restart the development server for Webpack to discover it. This plugin
    // makes the discovery automatic so you don't have to restart.
    // See https://github.com/facebook/create-react-app/issues/186
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Generate a manifest file which contains a mapping of all asset filenames
    // to their corresponding output file so that tools can pick it up without
    // having to parse `index.html`.
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
      publicPath: publicPath,
    }),
    new CopyWebpackPlugin( [
			{ from: `${blockDir}node_modules/tinymce/plugins`, to: 'static/js/plugins' },
			{ from: `${blockDir}node_modules/tinymce/themes`, to: 'static/js/themes' },
			{ from: `${blockDir}node_modules/tinymce/skins`, to: 'static/js/skins' },
		], {} ),
    ],
    resolveLoader: {
        plugins: [
          PnpWebpackPlugin.moduleLoader(module),
        ],
      },
      node: {
        dgram: 'empty',
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
        child_process: 'empty',
      },
    stats: {
      children: false,
    },
};
  