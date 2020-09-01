const gulp = require('gulp');
const zip = require('gulp-zip');

exports.default = () => (
  gulp.src('src/*')
    .pipe(zip('chrome-twitter-print-styles.zip'))
    .pipe(gulp.dest('dist'))
);
