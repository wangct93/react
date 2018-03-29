/**
 * Created by Administrator on 2017/2/28.
 */
let path = require('path');
let webpack = require('webpack');


let src = 'react/src/index.js';


module.exports = {
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
    ],
    devServer:{
        contentBase:__dirname,
        historyApiFallback:true,
        inline:true,
        port:9000
    }
};