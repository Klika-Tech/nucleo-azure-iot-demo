const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const WebpackShellPlugin = require('webpack-shell-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './index.js',
    output: {
        path: path.join(__dirname, 'dist'),
        library: '[name]',
        filename: 'app.js'
    },
    target: 'node',
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/,
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.json$/,
                loader: 'json'
            }
        ]
    },
    plugins: [
        new WebpackShellPlugin({
            onBuildStart: ['npm install; npm prune']
        }),
        new CleanWebpackPlugin(['dist']),
        new CopyWebpackPlugin([
            { from: 'web.config', to: 'web.config' }
        ])
    ]
};
