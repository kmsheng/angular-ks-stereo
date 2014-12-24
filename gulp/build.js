'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();

gulp.task('scripts', function () {
  return gulp.src('./src/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.size());
});

gulp.task('build', function() {
  return gulp.src([
    './src/app.module.js',
    './src/app.constants.js',
    './src/**/*.service.js',
    './src/**/*.directive.js'
  ])
 .pipe($.concat('angular-ks-stereo.js'))
 .pipe($.ngAnnotate())
 .pipe(gulp.dest('dist'))
 .pipe($.rename('angular-ks-stereo.min.js'))
 .pipe($.uglify())
 .pipe(gulp.dest('dist'))
 .pipe($.size());
});
