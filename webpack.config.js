// Define API's host URL - dev or production
var path = require('path');
var webpack = require('webpack');
var UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    context: __dirname,

    entry: {
        scorecard: ['babel-polyfill', 'whatwg-fetch', './src/public/javascript/scorecard.js'],
        'scorecard-admin': ['babel-polyfill', './src/public/javascript/scorecard-admin.js'],
        skill: ['babel-polyfill', './src/public/javascript/skill-admin.js'],
        queues: ['babel-polyfill', './src/public/javascript/queue-dashboard.js'],
        map: ['babel-polyfill', './src/public/javascript/maps-dashboard.js'],
        admin: ['babel-polyfill', './src/public/javascript/admin.js'],
        upload: ['babel-polyfill', './src/public/javascript/upload.js'],
        'message-panel': ['babel-polyfill', './src/public/javascript/message-panel.js']
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
                loader: "babel-loader"
            }
        ]
    },

    resolve: {
        alias: {
            vue: 'vue/dist/vue.js'
        }
    },

    plugins: [
        new webpack.DefinePlugin({
            'process.env': { NODE_ENV: JSON.stringify('production') }
        }),
        new UglifyJsPlugin()
    ]
}
