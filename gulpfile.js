/**
 * Created by Administrator on 2017/12/6.
 */



let gulp = require('gulp');
let rename = require('gulp-rename');
let concat = require('gulp-concat');
let uglify = require('gulp-uglify');
let browserify = require('gulp-browserify');
let babelify = require('babelify');
let babel = require('gulp-babel');
let plumber = require('gulp-plumber');
let fs = require('fs');
let path = require('path');
let minifyCss = require('gulp-minify-css');


let utilConfig = require('./config/utilConfig.json');


let less = require('gulp-less');
let plumnber = require('gulp-plumber');



/**
 * 生成浏览器util
 */
let {client} = utilConfig;
gulp.task('clientUtil',() => {
    let promise = gulp.src(client.path).pipe(plumnber());
    promise = promise.pipe(browserify()).pipe(babel({
        presets:['es2015']
    }));
    promise = promise.pipe(concat(client.fileName || 'util.js'));
    if(client.compress){
        promise = promise.pipe(uglify({
            ie8:true
        }));
    }
    return promise.pipe(gulp.dest(client.dest));
});
gulp.watch(['./modules/**'],['clientUtil']);
gulp.task('default',['clientUtil']);

gulp.task('minCss',function(){
    gulp.src(['./static/util/css/common.css','./static/zjb/css/index.css'])
        .pipe(concat('min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./static/zjb/css'));
});
// gulp.watch(['./static/zjb/css/index.css'],['minCss']);


/**
 * 转化jsx,es6任务
 */
// gulp.task('babelJsx',function(){
//     return gulp.src('./static/blog_react/jsx/*')
//         .pipe(browserify({
//             transform:[
//                 babelify.configure({
//                     presets: ['react','es2015']
//                 })
//             ]
//         }))
//         // .pipe(babel({
//         //     presets:['react','es2015']
//         // }))
//         .pipe(rename(function(path){
//             path.extname  = '.js';
//         }))
//         // .pipe(uglify())
//         .pipe(gulp.dest('./static/blog_react/temp_browse'))
// });
//
// gulp.task('browse',function(){
//     return gulp.src('./static/blog_react/src/index.js')
//         .pipe(plumber())
//         .pipe(browserify({
//             // transform:[
//             //     babelify.configure({
//             //         presets: ['es2015'],
//             //         compact:true
//             //     })
//             // ]
//         }))
//         .pipe(uglify())
//         .pipe(gulp.dest('./static/blog_react/js'))
// });



// gulp.watch(['./static/blog_react/jsx/*','./static/blog_react/src/*'],['browse']);











// let lessPath = ['./static/react/pages/novel/less/*.less'];
let lessPath = ['./static/react/less/*.less'];
gulp.task('less',() => {
    return gulp.src(lessPath)
        .pipe(plumnber())
        .pipe(less())
        // .pipe(rename((file)=>{
        //     file.basename = 'less_' + file.basename;
        // }))
        .pipe(gulp.dest(path.join(lessPath[0],'../../css')))
});
gulp.watch(lessPath,['less']);

























//已修改base64匹配正则，需要在图片地址后加 ?_b 表示直接使用base64
//gulp.task('base64',function(){
//    gulp.src('./static/css/login.css')
//    .pipe(base64())
//    .pipe(gulp.dest(__dirname + '/static'));
//});

//已修改spriter匹配正则，需要在图片地址后加 ?_sp 表示需要进行合并雪碧图
//gulp.task('spriter',function(){
//    gulp.src('./static/css/login.css')
//    .pipe(spriter({
//            spriteSheet:'./static/s.png',
//            pathToSpriteSheetFromCSS:'./s.png'
//        }))
//    .pipe(gulp.dest(__dirname + '/static'));
//});