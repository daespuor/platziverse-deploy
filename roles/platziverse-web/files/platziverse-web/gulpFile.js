'use strict'

const gulp = require('gulp')
const browserify = require('browserify')
const babelify = require('babelify')
const envify= require('gulp-envify')
const uglify= require('gulp-uglify')
const source= require('vinyl-source-stream')
const rename= require('gulp-rename')

gulp.task('bundle',()=>{
    browserify('./client/index.js')
    .transform(babelify,{"presets": ["env"],"plugins":['syntax-async-functions','transform-runtime']})
    .bundle()
    .on('error',function(err){ console.log(err); this.emit('end');})
    .pipe(source('app.js'))
    .pipe(gulp.dest('public'))

})

gulp.task('compress',()=>{
    gulp.src('public/app.js')
    .pipe(uglify())
    .pipe(envify(['production']))
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest('public'))
})

gulp.task('default',['bundle','compress'])