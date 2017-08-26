const gulp = require('gulp');
const zip = require('gulp-zip');

gulp.task('default', () =>
  gulp.src('src/*')
    .pipe(zip('chrome-twitter-print-styles.zip'))
    .pipe(gulp.dest('dist'))
);
