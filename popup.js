/*document.getElementById("askBtn").addEventListener("click", async () => {
  const question = document.getElementById("userInput").value.trim();
  const responseDiv = document.getElementById("response");

  if (!question) {
    responseDiv.textContent = "Please type something first!";
    return;
  }

  responseDiv.textContent = "Thinking...";
  setTimeout(() => {
    responseDiv.textContent = `Pretend AI says something smart about: "${question}"`;
  }, 800);
});

document.getElementById("setKey").addEventListener("click", async () => {
  const key = prompt("Enter your OpenAI API key:");
  if (key) {
    await chrome.storage.sync.set({ openaiKey: key });
    alert("✅ API key saved!");
  }
});*/

document.addEventListener("DOMContentLoaded", () => {
  const status = document.getElementById("status");

  // Save API key
  document.getElementById("setKey").addEventListener("click", async () => {
    const key = prompt("Enter your OpenAI API key (starts with sk-):");
    if (key) {
      await chrome.storage.sync.set({ openaiKey: key });
      status.textContent = "✅ API key saved!";
      console.log("[popup] Key saved");
    } else {
      status.textContent = "⚠️ No key entered.";
    }
  });

  // Open Sticky note on current page
  document.getElementById("openSticky").addEventListener("click", async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.url.startsWith("http")) {
        alert("Sticky AI works only on normal web pages (not chrome://, extensions, or new tab pages).");
        return;
    }
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"]
      });
      console.log("[popup] Sticky note injected");
      window.close(); // close popup after injecting
    } catch (err) {
      console.error("[popup] Failed to inject:", err);
      status.textContent = "❌ Failed to inject Sticky AI.";
    }
  });
});
