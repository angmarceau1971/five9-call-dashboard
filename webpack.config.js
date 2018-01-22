// Define API's host URL - dev or production
var path = require('path');
var webpack = require('webpack');

module.exports = {
    context: __dirname,

    entry: {
        scorecard: ['./src/public/javascript/scorecard.js'],
        queues: ['./src/public/javascript/queue-dashboard.js'],
        map: ['./src/public/javascript/maps-dashboard.js'],
        admin: ['./src/public/javascript/admin.js']
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
                use: [
                     'babel-loader'
                ]
            }
        ]
    }
}
