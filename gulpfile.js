/**
 * Created by user on 24/11/15.
 */
"use strict"

var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    minifycss = require('gulp-minify-css'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    del = require('del');


gulp.task('jshint', function() {
    gulp.src(['**/*.js',
        '!js/lib/**',
        '!node_modules/**'])
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter());
});

gulp.task('minifycss', function() {
    return gulp.src('css/*.css')
       .pipe(rename({suffix: '.min'}))
       .pipe(minifycss())
       .pipe(gulp.dest('css'));
});

gulp.task('minifyjs', function() {
    return gulp.src('js/*.js')
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('js'));
});

gulp.task('clean',function(cb) {
    del(['css/*.min.css','js/*.min.js'], cb);
});

gulp.task('default', ['clean','minifycss','minifyjs']);
