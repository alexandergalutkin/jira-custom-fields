const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
    mode: 'production',
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'dist.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                terserOptions: {
                    format: {
                        comments: 'all',
                    },
                },
            }),
        ],
    },
    plugins: [
        new webpack.BannerPlugin({
            raw: true,
            banner: `// ==UserScript==
// @name         JCF
// @namespace    https://tampermonkey.net/
// @version      0.0.2-ts
// @description  Jira Custom Fields for 4logist
// @author       You
// @match        https://4logist.atlassian.net/jira/software/c/projects/DEV/boards/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @grant        GM_addStyle
// ==/UserScript==

`,
        }),
    ],
}
