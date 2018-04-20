/**
 * Created by Administrator on 2017/2/28.
 */
let path = require('path');
let webpack = require('webpack');


// let src = 'react/src/index.js';
let src = 'works/echarts/src/index.js';
// let src = 'react/pages/novel/src/index.js';


let reactModule = {
    mode:'development',      //development:开发模式      production:上线模式
    entry: {
        index:path.resolve(__dirname,'static',src)
    },
    output: {
        path:path.resolve(__dirname,'static',src,'../../js'),
        filename: '[name].js'
    },
    module:{
        rules:[
            {
                test:/\.jsx?$/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['react','es2015']
                    }
                },
                exclude:/node_modules/
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        // new HtmlWebpackPlugin({template: './test/index.html'})
    ]
};


let babelModule = {
    mode:'development',      //development:开发模式      production:上线模式
    entry: {
        index:path.resolve(__dirname,'static/works/elsfk/src/index.js')
    },
    output: {
        path:path.resolve(__dirname,'static/works/elsfk/js'),
        filename: '[name].js'
    },
    module:{
        rules:[
            {
                test:/\.jsx?$/,
                use:{
                    loader:'babel-loader',
                    options:{
                        presets:['es2015']
                    }
                },
                exclude:/node_modules/
            }
        ]
    },
    plugins: [
        // new webpack.optimize.UglifyJsPlugin(),
        // new HtmlWebpackPlugin({template: './test/index.html'})
    ]
};


module.exports = reactModule;