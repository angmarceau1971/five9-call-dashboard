const path = require('path');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HardSourceWebpackPlugin = require('hard-source-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

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
                options: {
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            },
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: file => {
                    /node_modules/.test(file) &&
                    !/\.vue\.js/.test(file)
                }
            },
            {
                test: /\.css$/,
                use: [
                    'vue-style-loader',
                    'css-loader'
                ]
            }
        ]
    },

    resolve: {
        alias: {
            vue: 'vue/dist/vue.min.js'
        }
    },

    plugins: [
        new VueLoaderPlugin(),

        // Cache processed files to reduce build time
        new HardSourceWebpackPlugin(),
    ],

    optimization: {
        minimizer: [
            // Minimize JavaScript output
            new UglifyJsPlugin({
                sourceMap: true,
                parallel: true,
                cache: true
            })
        ]
    }
};
