# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.0.0] - 2025-03-03

### Breaking Changes

- 🔄 Upgraded from Manifest v2 to Manifest v3 to comply with Chrome's requirements.
- ✨ Added support for x.com domain following Twitter's rebranding.

## [2.1.5] - 2023-07-01

### Fixed

- 🔥 Fix error finding tweets.

## [2.1.4] - 2022-01-03

### Fixed

- 🔥 Fix missing profile pictures.
- 📊 Fix polls not rendering correctly.
- 🪗 Fix squished images.
- 😜 Fix emojis causing issues with PDF filenames.

## [2.1.3] - 2021-11-07

### Added

- 🦊 Add Firefox Extension.

### Changed

- 🤖 Update npm dependencies.

### Fixed

- 📐 Fix `mediaLoaded()` check failing to complete in Firefox (removed `naturalWidth` requirement).

## [2.1.2] - 2021-07-10

### Changed

- 🤖 Update npm dependencies.
- ⏱ Reduce timeout error to 10 seconds

### Fixed

- 🙅‍♂️ Remove broken `isLoading()` check.

## [2.1.1] - 2020-09-26

- 📛 Renamed repo to `twitter-print-styles`.
- 🌚 Filled in logo white so it's easier to see in dark mode.

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

[Unreleased]: https://github.com/tannerhodges/twitter-print-styles/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.5...v3.0.0
[2.1.5]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.4...v2.1.5
[2.1.4]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/tannerhodges/twitter-print-styles/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/tannerhodges/twitter-print-styles/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/tannerhodges/twitter-print-styles/releases/tag/v1.0.0
