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
    .filter((el) => el.textContent.trim().match(/^\d+:\d+ (A|P)M\b/) && el.children.length <= 0)
    .pop();
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

  // Create a duplicate timeline with all of the tweets together,
  // then hide the standard app so we can print everything at once.
  const duplicate = document.createElement('div');
  duplicate.id = 'twitter-print-styles';
  duplicate.innerHTML = printHTML;
  timeline.insertBefore(duplicate, container);
  container.style.display = 'none';

  // Wait one more time, just to be sure _all_ our media is ready.
  await mediaLoaded(duplicate);

  // Annnd print!
  window.print();

  // Once that's done, revert back so we don't break the app.
  container.style.display = '';
  timeline.removeChild(duplicate);
});
