const { DefinePlugin } = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: ['babel-polyfill', './src/'],
    output: {
        path: `${__dirname}/dist`,
        filename: 'bundle.js',
    },
    devServer: {
        host: '0.0.0.0',
        port: 8080,
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015', 'react'],
                    plugins: ['transform-object-rest-spread'],
                },
            },
            {
                test: /\.scss$/,
                loaders: ['style', 'css', 'sass'],
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite',
            }, {
                test: /\.(woff2?|png|gif)$/,
                loader: 'file',
            },
            {
                test: /\.json$/,
                loader: 'json',
            },
        ],
        noParse: [
            /aws-sdk/,
        ],
    },
    plugins: [
        new DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new WebpackShellPlugin({
            onBuildStart: ['npm install; npm prune'],
        }),
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([
            { from: 'web.config', to: 'web.config' },
        ]),
    ],
};
