var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass');

gulp.task('build-sass', function() {
  return gulp.src('resources/stylesheets/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  gulp.watch('resources/stylesheets/**/*.scss', ['build-sass']);
  gulp.watch('resources/javascripts/**/*.js', ['build-js']);
  gulp.watch('resources/javascripts/**/*.js', ['build-admin-js']);
});

gulp.task('default', function() {
  gulp.run('build-js', 'build-sass', 'build-css', 'build-admin-js');
});

gulp.task('build-js', function() {
  return gulp.src([
      'resources/javascripts/libs/jquery.1.11.3.js',
      'resources/javascripts/libs/!(jquery.1.11.3)*.js',
      'resources/javascripts/env.js',
      'resources/javascripts/helpers.js',
      'resources/javascripts/bootstrap.js',
      'resources/javascripts/connect.js',
      'resources/javascripts/strings.js',
      'resources/javascripts/!(bootstrap, connect, strings, helpers env)*.js'
    ])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public/js'));
});

gulp.task('build-css', function() {
  return gulp.src([
    'resources/stylesheets/lib/*.css'
  ])
  .pipe(concat('lib.css'))
  .pipe(gulp.dest('public/css'));
});

gulp.task('build-admin-js', function () {
  return gulp.src([
      'resources/javascripts/libs/jquery.1.11.3.js',
      'resources/javascripts/libs/!(jquery.1.11.3)*.js',
      'resources/javascripts/bootstrap.js',
      'resources/javascripts/admin/globals.js',
      'resources/javascripts/admin/!(globals, connect)*.js',
      'resources/javascripts/admin/connect.js',
    ])
    .pipe(concat('admin.js'))
    .pipe(gulp.dest('public/admin/js'));
});