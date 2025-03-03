// When a user clicks on the extension action...
chrome.action.onClicked.addListener(() => {
  // Tell the active tab to load the entire thread.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { message: 'load_entire_thread' });
  });
});
