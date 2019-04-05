var postcssSass = require("postcss-sass");
module.exports = {
    parser: postcssSass,
    sourceMap: true,
    plugins: [
        require('autoprefixer')({
          'browsers': ['> 1%', 'last 2 versions']
        })
      ]
  };