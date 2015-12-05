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
  return gulp.src('resources/javascripts/**/*.js')
      .pipe(concat('bundle.js'))
    .pipe(gulp.dest('public/js'));
});