/**
 * External dependencies
 */
const { resolve } = require('path');

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractCSS = new ExtractTextPlugin('./css/style.css');
const extractBLCSS = new ExtractTextPlugin('./css/block-library/style.css');
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

process.traceDeprecation = true;
//const PostCssWrapper = require('postcss-wrapper-loader');
//const StringReplacePlugin = require('string-replace-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

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

// style files regexes
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

/**
 * Given a string, returns a new string with dash separators converedd to
 * camel-case equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will convert letters following
 * numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
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

const alias = {};

[
    'api-fetch',
    'url',
].forEach(name => {
    externals[ `@wordpress/${name}` ] = {
        this: [ 'wp', camelCaseDash(name) ],
    };
});

module.exports = {
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
    devtool: 'source-map',
    entry: './src/index.js',
    output: {
        pathinfo: true,
        filename: 'js/gutenberg-js.js',
        path: resolve(__dirname, 'build'),
        libraryTarget: 'this',
        publicPath: publicPath,
        devtoolModuleFilenameTemplate: info =>
            path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    externals,
    resolve: {
        modules: [
            __dirname,
            resolve(__dirname, 'node_modules'),
        ],
        alias,
    },
    module: {
        rules: [
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
                            replacePath: resolve(__dirname, 'src/js/gutenberg-overrides/@wordpress'),
                        },
                    },
                ],
            },
            
            /* {
              test: /editor\.s?css$/,
              include: [
                /block-library/,
              ],
              use: mainCSSExtractTextPlugin.extract({
                use: [
                  {
                    // removing .gutenberg class in editor.scss files
                    loader: StringReplacePlugin.replace({
                      replacements: [ {
                        pattern: /.gutenberg /ig,
                        // replacement: () => (''),
                        replacement: () => ('.gutenberg__editor'),
                      } ],
                    }),
                  },
                  ...extractConfig.use,
                ],
              }),
            },*/
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
    plugins: [
        extractCSS,
        extractBLCSS,
        // wrapping editor style with .gutenberg__editor class
        new HtmlWebpackPlugin({
            inject:true,
            filename:'index.php',
            template: paths.appHtml,
            chunks:{
                head:{
                    css:['./css/block-library/edit-blocks.css', '.gutenberg__editor'] 
                },
                main:{}
            },
            ...blockVars,
        }),
         //new StringReplacePlugin(),
      
        new CleanWebpackPlugin(['build']),
        
 
    ],
    stats: {
        children: false,
    },
};