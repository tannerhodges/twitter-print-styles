# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Renamed repo to `twitter-print-styles`.

## [2.1.0] - 2020-09-03

### Added

- 👷‍♂️ Build Process FTW.

### Changed

- ✂️ Shorten document title below max filename length.
- 🖼 Open timeline in a separate window.
- 📷 Adjust media sizing to better fit within the page.
- 🏎 Add 50ms delay to help reduce risk of [rate limits](https://developer.twitter.com/en/docs/twitter-api/rate-limits).

### Fixed

- 🔥 Fix unstable timeline selector.
- 🙈 Fix background images not showing up on print.
- ⏰ Fix timestamp element not matching in other languages.

## [2.0.0] - 2020-08-31

### Changed

- Rewrite JS & CSS to work with the latest version of Twitter.
- Allow extension to run on all Twitter pages (since Twitter is a SPA now).
- Update JavaScript code to ES6.
- Update `package.json` (and remove yarn).
- Update linters and formatters (stylelint, eslint, editorconfig).

## [1.0.0] - 2018-01-12

### Added

- Load entire thread (auto-scroll and open all "more replies").
- Link timestamp of tweet to current page.
- Prevent tall images from overflowing the page.
- Automatically print when replies have finished loading.
- Hide promoted tweets.

[Unreleased]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/tannerhodges/twitter-print-styles/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/tannerhodges/twitter-print-styles/releases/tag/v1.0.0
