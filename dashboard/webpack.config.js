var webpack = require('webpack')

module.exports = {
  entry: './main.jsx',
  output: { path: __dirname + '/dist', filename: 'bundle.js' },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['react']
        }
      },
      {
        test: /\.scss$/,
        loaders: ['style', 'css', 'sass']
      }
    ],
	noParse: [
		/aws\-sdk/
	]
  },
  resolve: {
  	extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx']
  },
  plugins: [
  	new webpack.ProvidePlugin({
		'Promise': 'exports?global.Promise!es6-promise',
		'fetch': 'exports?self.fetch!whatwg-fetch'
		})
  ]
}
