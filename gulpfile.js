const { dest, parallel, series, src, watch } = require('gulp');
const clean = require('postcss-clean');
const fs = require('fs');
const postcss = require('gulp-postcss');
const prefixer = require('postcss-prefix-selector');
const replace = require('gulp-replace');
const zip = require('gulp-zip');

/**
 * Process CSS to work with both default Twitter print styles,
 * and the custom print screen that we open in a new window.
 */
function copy() {
  return src('src/*')
    .pipe(dest('dist/'));
}
exports.copy = copy;

/**
 * Process CSS to work with both default Twitter print styles,
 * and the custom print screen that we open in a new window.
 */
const css = parallel(
  // Wrap everything in a print media query so we can apply
  // it to Twitter's default print styles.
  function defaultPrintCSS() {
    return src('src/index.css')
      .pipe(replace('/* BEGIN */', '@media print {'))
      .pipe(replace('/* END */', '}'))
      .pipe(dest('dist/'));
  },
  // Prefix everything with a custom ID, then compress it to
  // fit in a <style> tag for the custom print window.
  function customPrintCSS() {
    return src('src/index.css')
      .pipe(postcss([
        prefixer({ prefix: '#twitter-print-styles' }),
        clean()
      ]))
      .pipe(dest('build/'));
  }
);
exports.css = css;

/**
 * Process JS to include our CSS in the custom print window.
 */
function js() {
  return src('src/content.js')
    .pipe(replace('/* STYLES */', fs.readFileSync('build/index.css', 'utf8')))
    .pipe(dest('dist/'));
}
exports.js = js;

/**
 * ZIP final build for publishing on the Chrome Web Store.
 */
function zipTask() {
  return src('dist/*')
    .pipe(zip('chrome-twitter-print-styles.zip'))
    .pipe(dest('./'));
}
exports.zip = zipTask;

// Tasks
exports.default = series(copy, css, js);

// Watch
exports.watch = () => watch('src/*', exports.default);
