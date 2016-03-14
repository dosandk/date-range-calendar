var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var compass = require('gulp-compass');
var concat = require('gulp-concat');
var minify = require('gulp-cssnano');
var clean = require('gulp-clean');

// Task for serving blog with Browsersync
gulp.task('browserSync', function () {
    browserSync.init({
        //proxy: "localhost:4000/blog/"
    });
    // Reloads page when some of the already built files changed:
    gulp.watch('src/**/*.*').on('change', browserSync.reload);
});

gulp.task('compile-scss', function() {
    return gulp.src('./src/scss/**/*.scss')
        .pipe(compass({
            config_file: './config.rb',
            css: 'src/css',
            sass: 'src/scss'
        }))
        .pipe(gulp.dest('./src/css'));
});

gulp.task('build:css', ['clean', 'compile-scss'], function() {
    gulp.src(['./src/css/**/*.css'])
        .pipe(concat('drp.min.css'))
        .pipe(minify())
        .pipe(gulp.dest('./dist'));
});

gulp.task('build:js', ['clean'], function() {
    gulp.src(['./src/js/**/*.js'])
        .pipe(gulp.dest('./dist'));
});

gulp.task('clean', function () {
    return gulp.src('./dist', { read: false })
        .pipe(clean());
});

gulp.task('build', ['build:css', 'build:js']);

gulp.task('default', ['browserSync']);