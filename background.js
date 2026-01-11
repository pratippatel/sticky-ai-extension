
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getAPIKey") {
    console.log("[background] Received getAPIKey request");
    chrome.storage.sync.get("openaiKey", (data) => {
      console.log("[background] Retrieved key?", !!data.openaiKey);
      sendResponse({ openaiKey: data.openaiKey || null });
    });
    return true; // <-- keeps the message channel open
  }
  if (message.action === "saveAPIKey") {
    chrome.storage.sync.set({ openaiKey: message.key }, () => {
      console.log("[background] Key saved");
      sendResponse({ success: true });
    });
    return true;
  }
});

