/**
 * Created by Administrator on 2017/12/6.
 */



const gulp = require('gulp');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browserify = require('gulp-browserify');
const babelify = require('babelify');
const babel = require('gulp-babel');
const plumber = require('gulp-plumber');
const fs = require('fs');
const path = require('path');
const minifyCss = require('gulp-minify-css');

const utilConfig = require('./config/util.json');


let less = require('gulp-less');
let plumnber = require('gulp-plumber');




/**
 * 生成浏览器util
 */
let {client} = utilConfig;
let babelJsPath = client.path.map(item => {
    return path.resolve(__dirname,item,'../../**/*.js');
});
gulp.task('util',['babelJs'],() => {
    let filePath = client.path.map(item => {
        return path.resolve(__dirname,'temp',item.replace(/^.*[\\\/]lib[\\\/]/,''));
    });
    let promise = gulp.src(filePath);
    promise = promise.pipe(plumnber()).pipe(browserify());
    promise = promise.pipe(concat(client.fileName || 'util.js'));
    if(client.compress){
        promise = promise.pipe(uglify({
            ie8:true
        }));
    }
    return promise.pipe(gulp.dest(client.dest));
});
//
gulp.task('babelJs',() => {
    return gulp.src(babelJsPath)
        .pipe(plumnber())
        .pipe(babel({
            presets:[
                [
                    'es2015',
                    {
                        loose:true
                    }
                ]
            ]
        }))
        .pipe(gulp.dest('temp'))
});

gulp.task('default',['util']);

gulp.task('minCss',function(){
    gulp.src(['./static/util/css/common.css','./static/zjb/css/index.css'])
        .pipe(concat('min.css'))
        .pipe(minifyCss())
        .pipe(gulp.dest('./static/zjb/css'));
});
// gulp.watch(['./static/zjb/css/index.css'],['minCss']);


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


/**
 * 监视
 */

// gulp.watch(['./modules/**'],['util']);
gulp.watch(lessPath,['less']);