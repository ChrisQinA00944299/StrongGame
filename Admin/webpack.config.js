const path = require('path');

module.exports = {
  entry: './src/index.js',
  mode: 'development',
  watch: true,
  output: {
    filename: 'application.js',
    path: path.resolve(__dirname, 'dist')
  },

   devServer: {
    port: 4000
  },

  module:{
     rules:[
             {
                 test:/\.(s*)css$/,
                 use:['style-loader','css-loader', 'sass-loader'],
                 
              },
              {
                 test: /\.html$/,
                 loader: "raw-loader"
              }
      ]
	},



};