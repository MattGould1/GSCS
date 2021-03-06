var gulp = require('gulp'),
  imagemin = require('gulp-imagemin'),
	concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
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
  gulp.run('build-js', 'build-sass', 'build-css', 'build-admin-js', 'build-tincyme-themes', 'sounds', 'mce-plugins');
});

gulp.task('build-tincyme-themes', function () {
  return gulp.src([
    'resources/javascripts/vendor/modern.js'
    ])
    // .pipe('modern.js')
    .pipe(gulp.dest('public/js/themes'));
});

gulp.task('mce-plugins', function () {
  return gulp.src([
      'resources/javascripts/vendor/mce-plugins/**/*.js'
    ])
    .pipe(gulp.dest('public/js/themes/plugins'));
});

gulp.task('move-fonts', function () {
  return gulp.src([
      'resources/tinymce.tff',
      'resources/tinymce.woff',
    ])
    .pipe(gulp.dest('public/css/'));
});
gulp.task('move-vendor-css', function () {
  return gulp.src([
      'resources/vendorcss/content.min.css',
      'resources/vendorcss/skin.min.css',
      'resources/vendorcss/calendar.css'
    ])
    .pipe(gulp.dest('public/css/'));
});
gulp.task('build-js', function() {
  return gulp.src([
      'resources/javascripts/libs/jquery.1.11.3.js',
      'resources/javascripts/libs/moment.js',
      'resources/javascripts/libs/handsontable.full.min.js',
      'resources/javascripts/libs/!(jquery.1.11.3, handsontable.full.min, moment)*.js',
      'resources/javascripts/env.js',
      'resources/javascripts/helpers.js',
      'resources/javascripts/bootstrap.js',
      'resources/javascripts/strings.js',
      'resources/javascripts/ui.js',
      'resources/javascripts/word.js',
      'resources/javascripts/users.js',
      'resources/javascripts/!(bootstrap, connect, strings, helpers, env, word, users, calendar)*.js',
      'resources/javascripts/calendar.js',
      'resources/javascripts/connect.js',
      
    ])
    .pipe(concat('bundle.js'))
    //.pipe(uglify())
    .pipe(gulp.dest('public/js'));
});

gulp.task('imagemin', function () {
    return gulp.src('resources/images/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('public/img'));
});

gulp.task('build-css', function() {
  return gulp.src([
    'resources/stylesheets/lib/*.css'
  ])
  .pipe(concat('lib.css'))
  .pipe(gulp.dest('public/css'));
});


gulp.task('sounds', function () {
  return gulp.src([
    'resources/sounds/*.mp3',
  ]).pipe(gulp.dest('public/sounds/'));
});
gulp.task('build-admin-js', function () {
  return gulp.src([
      'resources/javascripts/libs/jquery.1.11.3.js',
      'resources/javascripts/libs/moment.js',
      'resources/javascripts/libs/!(jquery.1.11.3)*.js',
      'resources/javascripts/bootstrap.js',
      'resources/javascripts/admin/globals.js',
      'resources/javascripts/admin/!(globals, connect)*.js',
      'resources/javascripts/admin/connect.js',
    ])
    .pipe(concat('admin.js'))
    .pipe(gulp.dest('public/admin/js'));
});