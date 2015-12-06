var gulp = require('gulp'),
	concat = require('gulp-concat'),
	sass = require('gulp-sass');

gulp.task('default', ['watch']);

gulp.task('build-css', function() {
  return gulp.src('resources/stylesheets/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('public/css'));
});

gulp.task('watch', function() {
  gulp.watch('resources/stylesheets/**/*.scss', ['build-css']);
  gulp.watch('resources/javascripts/**/*.js', ['build-js']);
});

gulp.task('build-js', function() {
  return gulp.src([
      'resources/javascripts/bootstrap.js',
      'resources/javascripts/bootstrap/*.js',
      'resources/javascripts/libs/*.js',
      'resources/javascripts/connect.js',
      'resources/javascripts/!(bootstrap, connect)*.js'
    ])
    .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public/js'));
});