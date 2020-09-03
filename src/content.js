/**
 * Wait until something happens.
 *
 * @param  {Function}  fn  Function to determine when we're done.
 * @param  {Number}    ms  Milliseconds to check each interval. Defaults to 50ms.
 * @return {Promise}
 */
function waitUntil(fn, ms = 50) {
  return new Promise((resolve) => {
    const wait = setInterval(() => {
      // Add a callback that will clear the interval & resolve the promise.
      const cb = (response) => {
        clearInterval(wait);
        resolve(response);
      };
      // Call the function.
      fn(cb);
    }, ms);
  });
}

/**
 * Wait until all images and videos in an element have loaded.
 *
 * @param  {Element}  el
 * @return {Promise}
 */
function mediaLoaded(el) {
  // Find all the images and videos.
  const media = Array.from(el.querySelectorAll('img, video'));

  // Create promises for every file that hasn't finished loading yet.
  const promises = media.filter((m) => {
    return m.tagName === 'VIDEO'
      ? m.readyState !== 4
      : !(m.complete && m.naturalWidth);
  }).map((m) => new Promise((resolve) => {
    m[m.tagName === 'VIDEO'
      ? 'onloadeddata'
      : 'onload'] = resolve;
    m.onerror = resolve;
  }));

  // Wait until every file has finished loading.
  return Promise.all(promises);
}

/**
 * A tweet is still loading if it has a progress bar element.
 *
 * @param  {Element}  tweet
 * @return {Boolean}
 */
function isLoading(tweet) {
  return tweet.querySelector('[role="progressbar"]');
}

/**
 * The first tweet is at the very top of the timeline.
 *
 * @param  {Element}  tweet
 * @return {Boolean}
 */
function isFirstTweet(tweet) {
  return tweet.matches('[style*="transform: translateY(0px)');
}

/**
 * The last tweet is a non-zero height block with empty content.
 *
 * NOTE: Be careful not to confuse this with other empty blocks
 * (e.g., the placeholder after the first tweet in a thread).
 *
 * @param  {Element}  tweet
 * @return {Boolean}
 */
function isLastTweet(tweet) {
  return tweet.offsetHeight > 0 && tweet.textContent.trim().length <= 0;
}

/**
 * "More reply" buttons get their own box in the timeline, and they
 * _only_ contain the words "# of replies".
 *
 * @param  {Element}  tweet
 * @return {Boolean}
 */
function isMoreReplies(tweet) {
  return tweet.textContent.trim().match(/^(\d+|Show) more repl(y|ies)$/);
}

/**
 * Get the timestamp element in a tweet.
 *
 * @param  {Element}  tweet
 * @return {Boolean}
 */
function getTimestampElement(tweet) {
  return Array.from(tweet.querySelectorAll('*'))
    .filter((el) => el.textContent.trim().match(/^\d+:\d+ \w+\b/) && el.children.length <= 0)
    .pop();
}

/**
 * Get all CSS from all stylesheets in a document.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/StyleSheetList
 * @param  {Element}  doc
 * @return {Boolean}
 */
function getAllCSS(doc = document) {
  return [...doc.styleSheets]
    .map(styleSheet => {
      try {
        return [...styleSheet.cssRules]
          .map(rule => rule.cssText)
          .join('');
      } catch (e) {
        console.log('Access to stylesheet %s is denied. Ignoring...', styleSheet.href);
      }
    })
    .filter(Boolean)
    .join('\n');
}

/**
 * Shorten a string to a maximum number of characters,
 * without cutting off a word.
 *
 * @see https://stackoverflow.com/a/57044767/1786459
 * @param  {String}  str
 * @param  {Number}  max
 * @return {String}
 */
function shorten(str, max = 100) {
  return str && str.length > max
    ? str.slice(0, max).split(' ').slice(0, -1).join(' ')
    : str;
}

// ------------------------------
// PRINT TWEETS
// ------------------------------

let running = false;
let keepRunning = true;

// eslint-disable-next-line no-unused-vars
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  // Only run on "Load Entire Thread" requests.
  if (request.message !== 'load_entire_thread') {
    return;
  }

  // Multiple clicks cancels out any running tasks.
  if (running) {
    console.log('Cancelling current task...');
    keepRunning = false;
    return;
  }

  // Disable load script when print emulation is turned on.
  if (window.matchMedia('print').matches) {
    alert(`🚨 Whoops! Don't run Twitter Print Styles with print emulation turned on, otherwise it'll break the Twitter app.

Please turn print emulation off, then try again.

Dev Tools > More Tools > Rendering > Emulate CSS media type

🙏 Thanks.`);
    return;
  }

  // Get the timeline.
  // NOTE: While several views have "Timelines", this is
  // only expected to work on _Tweets_ & _Threads_.
  const timeline = document.querySelector('[aria-label*="Timeline"]');

  if (!timeline) {
    console.log('Could not find Twitter timeline.');
    return;
  }

  running = true;
  keepRunning = true;

  // Find the tweets.
  const container = timeline.firstElementChild;

  // Make sure we're actually on the first one.
  window.scrollTo(0, 0);
  await (new Promise((resolve) => setTimeout(resolve, 0)));

  // Then catch 'em all like Pokémon.
  let tweet = container.firstElementChild;
  let count = 0;
  let error = false;

  // Since Twitter only shows a few tweets in the DOM at a time, we need to
  // cache them in a variable so we can print them all together.
  let printHTML = '';

  do {
    // Ignore missing tweets.
    if (!tweet) {
      return;
    }

    // Make the first tweet's timestamp a clickable link.
    if (isFirstTweet(tweet)) {
      const timestamp = getTimestampElement(tweet);

      // If the timestamp isn't already a link, add one.
      if (timestamp && timestamp.parentNode.tagName !== 'A') {
        // Get the current URL and make an anchor for it.
        const link = document.createElement('a');
        link.href = window.location.href;
        link.style.color = 'inherit';
        link.style.textDecoration = 'none';
        // Wrap it around the timestamp element.
        timestamp.parentNode.appendChild(link);
        link.appendChild(timestamp);
      }
    }

    // If tweet has content, add it to the printer.
    if (tweet.textContent.trim().length > 0) {
      printHTML += tweet.outerHTML;
    }

    // Increment tweet count.
    count += 1;

    console.log(`Tweet #${count}`, tweet);

    // Scroll tweet to the top of the screen (to trigger Twitter's "load more" action).
    tweet.scrollIntoView(true);

    // Wait until next tweet loads.
    const timeout = Date.now();

    tweet = await waitUntil(async (resolve) => {
      const nextTweet = tweet.nextElementSibling;

      console.log('Finding next tweet...');

      // If we fail to find a tweet within 30 seconds, something's probably gone wrong.
      // Assume the worst and abort.
      if (Date.now() - timeout > 30000) {
        alert(`😩 Yikes! We've gotten stuck searching for a specific tweet and haven't found anything in over 30 seconds.

We're incredibly sorry for the inconvenience.

A few things to double check before trying again:

- Is your internet connection still working?
- Have you tried refreshing the page?
- Are you trying to print something other than a "Tweet" or "Thread"?

If you've confirmed all these things and are still seeing this error message, please open an issue in our GitHub repo:

https://github.com/tannerhodges/chrome-twitter-print-styles/issues`);
        error = true;
        resolve(false);
        return;
      }

      if (!nextTweet) {
        console.log('Tweet not found.', tweet);
        return;
      }

      if (isLoading(nextTweet)) {
        console.log('Loading...');
        return;
      }

      if (isLastTweet(nextTweet)) {
        console.log('--- THE END ---');
        resolve(false);
        return;
      }

      if (isMoreReplies(nextTweet)) {
        console.log('Loading more replies...');
        const moreReplies = nextTweet.querySelector('[role="button"]');
        moreReplies.click();
        return;
      }

      if (nextTweet) {
        // Wait until every image and video for this tweet has finished loading.
        await mediaLoaded(nextTweet);
        // Queue it up once it's fully loaded.
        resolve(nextTweet);
      }
    });
  } while (tweet && keepRunning);

  running = false;

  // If we ran into any errors collecting tweets, don't try to print anything.
  if (error) {
    return;
  }

  console.log('PRINT');

  // Copy the Twitter timeline into a new window.
  const clone = document.querySelector('[data-testid="primaryColumn"]').cloneNode(true);
  clone.querySelector('[aria-label*="Timeline"]').innerHTML = `<div>${printHTML}</div>`;

  const winHtml = `<!DOCTYPE html><html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=0,viewport-fit=cover">
      <link rel="shortcut icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 300'%3E %3Cstyle%3E@media (prefers-color-scheme: dark) %7B path %7B fill: %23fff; %7D %7D%3C/style%3E %3Cpath d='M150 0a150 150 0 1 0 150 150A150 150 0 0 0 150 0zm70.013 114.075c.075 1.5.075 3.075.075 4.65 0 47.775-36.375 102.9-102.9 102.9a100.76 100.76 0 0 1-55.275-16.35 65.763 65.763 0 0 0 8.625.525 72.7 72.7 0 0 0 44.925-15.45 36.11 36.11 0 0 1-33.75-25.125 34.528 34.528 0 0 0 6.825.675 36.052 36.052 0 0 0 9.525-1.275 36.2 36.2 0 0 1-29.026-35.475v-.45a35.525 35.525 0 0 0 16.35 4.5 36.148 36.148 0 0 1-11.25-48.225 102.6 102.6 0 0 0 74.55 37.8 33.143 33.143 0 0 1-.975-8.25 36.186 36.186 0 0 1 62.55-24.75A73.234 73.234 0 0 0 233.212 81a36.144 36.144 0 0 1-15.9 20.025 73.4 73.4 0 0 0 20.775-5.7 74.091 74.091 0 0 1-18.074 18.75z'%3E%3C/path%3E %3C/svg%3E">
      <title>${shorten(document.title, 200)}</title>
      <style>${getAllCSS(document)}</style>
      <style>/* STYLES */</style>
    </head>
    <body id="twitter-print-styles">
      ${clone.outerHTML}
    </body>
  </html>`;

  const winUrl = URL.createObjectURL(new Blob([winHtml], { type: 'text/html' }));

  const win = window.open(winUrl);

  // Wait one more time, just to be sure _all_ our media is ready.
  await mediaLoaded(win.document.querySelector('body'));

  // Annnd print!
  win.print();
});
