// Define API's host URL - dev or production
var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,

    entry: {
        scorecard: ['babel-polyfill', './src/public/javascript/scorecard.js']
    },

    output: {
        path: path.resolve('./src/public/assets/'),
        filename: '[name].js',
    },

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader',
            },
            {
                test: /\.scss$/,
                use: [{
                    loader: 'style-loader',
                }, {
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader'
                }]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    }
}
