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
const spriter = require('gulp-css-spriter');

const utilConfig = require('./config/util.json');


let less = require('gulp-less');


let minCssPath = './test/css/a.css';



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
    promise = promise.pipe(plumber()).pipe(browserify());
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
        .pipe(plumber())
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
    gulp.src(minCssPath)
        .pipe(minifyCss())
        .pipe(rename({
            suffix:'.min'
        }))
        .pipe(gulp.dest(path.resolve(__dirname,minCssPath,'..')));
});
// gulp.watch(['./static/zjb/css/index.css'],['minCss']);


// let lessPath = ['./static/react/pages/novel/less/*.less'];
let lessPath = ['./static/react/less/*.less'];
// let lessPath = ['./static/works/pages/views/sasp/modules/caseInput/less/index.less'];

gulp.task('less',() => {
    return gulp.src(lessPath)
        .pipe(plumber())
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

// 已修改spriter匹配正则，需要在图片地址后加 ?_sp 表示需要进行合并雪碧图

let spriterPath = './static/test/css/a.css';

gulp.task('spriter',function(){
   gulp.src(spriterPath)
       .pipe(spriter({
           spriteSheet:'./static/test/img/num.png',
           pathToSpriteSheetFromCSS:'../img/num.png'
       }))
       .pipe(rename('b.css'))
       .pipe(gulp.dest(path.resolve(__dirname,spriterPath,'..')));
});


/**
 * 监视
 */

gulp.watch(['./modules/**'],['util']);
gulp.watch(lessPath,['less']);