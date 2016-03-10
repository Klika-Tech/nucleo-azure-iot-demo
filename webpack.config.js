var webpack = require('webpack')

module.exports = {
  entry: "./main.jsx",
  output: { path: __dirname + "/dist", filename: "bundle.js" },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        query: {
          presets: ["react"]
        }
      }
    ]
  },
  plugins: [
  	new webpack.optimize.UglifyJsPlugin(),
  	new webpack.ProvidePlugin({
		'Promise': 'exports?global.Promise!es6-promise',
		'fetch': 'exports?self.fetch!whatwg-fetch'
		})
  ]
}
