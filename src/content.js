// ------------------------------
// Link timestamp of tweet to current page
// ------------------------------

// Get timestamp
const timestamp = document.querySelector('.client-and-actions .metadata');

// Add link to current URL
let timestampLink = document.createElement('a');
timestampLink.href = window.location.href;
timestamp.parentNode.appendChild(timestampLink);

// Wrap timestamp in link
timestampLink.appendChild(timestamp);



// ------------------------------
// Load entire thread (auto-scroll and open all "more replies")
// ------------------------------

// 1. Scroll to the bottom of the page
const modal = document.querySelector('.PermalinkOverlay');
const timelineEnd = modal.querySelector('.timeline-end');
function scrollToBottom() {
  modal.scrollTop = modal.scrollHeight;
  if (timelineEnd.classList.contains('has-more-items')) {
    setTimeout(scrollToBottom, 400);
  } else {
    loadMoreReplies();
  }
}

// 2. Load more replies
let moreReplies;
function getMoreReplies() {
  return [].filter.call(document.querySelectorAll('a, button'), (link) => {
    return link.innerText.match(/\d more repl/);
  });
}
function loadMoreReplies() {
  modal.scrollTop = modal.scrollHeight;
  moreReplies = getMoreReplies();

  // TODO: Wait until element transitions are complete, then print
  if (moreReplies.length <= 0) {
    window.print();
    return false;
  }

  moreReplies.map((link) => link.click());
  setTimeout(loadMoreReplies, 400);
}

// 3. Put it all together
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message !== 'load_entire_thread') { return false; }
  scrollToBottom();
});
