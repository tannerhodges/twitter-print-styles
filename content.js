// ------------------------------
// Link timestamp of tweet to current page
// ------------------------------

// Get timestamp
var timestamp = document.querySelector('.client-and-actions .metadata');

// Add link to current URL
var timestampLink = document.createElement('a');
timestampLink.href = window.location.href;
timestamp.parentNode.appendChild(timestampLink);

// Wrap timestamp in link
timestampLink.appendChild(timestamp);



// ------------------------------
// Load entire thread (auto-scroll and open all "more replies")
// ------------------------------

// 1. Scroll to the bottom of the page
var modal = document.querySelector('.PermalinkOverlay');
var timelineEnd = modal.querySelector('.timeline-end');
function scrollToBottom() {
  modal.scrollTop = modal.scrollHeight;
  if (timelineEnd.classList.contains('has-more-items')) {
    setTimeout(scrollToBottom, 400);
  } else {
    loadMoreReplies();
  }
}

// 2. Load more replies
var moreReplies;
function getMoreReplies() {
  return [].filter.call(document.querySelectorAll('a, button'), function(link) {
    return link.innerText.match(/\d more repl/);
  });
}
function loadMoreReplies() {
  modal.scrollTop = modal.scrollHeight;
  moreReplies = getMoreReplies();
  if (moreReplies.length <= 0) { return false; }
  moreReplies.map(function(link) { link.click(); });
  setTimeout(loadMoreReplies, 400);
}

// 3. Put it all together
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message !== 'load_entire_thread') { return false; }
  scrollToBottom();
});
