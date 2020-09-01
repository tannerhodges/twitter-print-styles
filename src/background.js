// When a user clicks on the browser action...
chrome.browserAction.onClicked.addListener(() => {
  // Tell the active tab to load the entire thread.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { message: 'load_entire_thread' });
  });
});
