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
