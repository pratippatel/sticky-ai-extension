// Ensure our CSS is present when injecting on demand
if (!document.getElementById("stickyAI-style")) {
  const link = document.createElement("link");
  link.id = "stickyAI-style";
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("style.css");
  
  const head = document.head || document.getElementsByTagName("head")[0] || document.documentElement;
  head.appendChild(link);
  //document.head.appendChild(link);
}
// Prevent multiple sticky notes
if (!document.getElementById("stickyAI")) {

  // Create main container
  const sticky = document.createElement("div");
  sticky.id = "stickyAI";
  sticky.innerHTML = `
    <div class="sticky-header">
      <span class="logo-icon" aria-hidden="true"></span>
      <span class="title-text">Sticky AI</span>
    </div>
    <p class="subtitle">Your AI note on any page</p>
    <textarea id="userInput" placeholder="Ask about this page..."></textarea>
    <div class="button-row">
    <button id="askBtn">Ask</button>
    <button id="summarizeBtn">Summarize Page</button>
    </div>
    <div id="response"></div>
    <span id="closeBtn">&times;</span>
  `;

  // Append to body
  document.body.appendChild(sticky);

  // Close button functionality
  const closeBtn = document.getElementById("closeBtn");
  closeBtn.addEventListener("click", () => {
    sticky.remove();
  });

  // Drag functionality (smoother version)
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let currentX = 0;
  let currentY = 0;
  let needsUpdate = false;

  const header = sticky.querySelector(".sticky-header");

  header.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - sticky.offsetLeft;
    offsetY = e.clientY - sticky.offsetTop;
    header.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    currentX = e.clientX - offsetX;
    currentY = e.clientY - offsetY;
    needsUpdate = true;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    header.style.cursor = "grab";
  });

  // Use requestAnimationFrame to optimize drag rendering
  function updatePosition() {
    if (needsUpdate) {
      sticky.style.left = `${currentX}px`;
      sticky.style.top = `${currentY}px`;
      needsUpdate = false;
    }
    requestAnimationFrame(updatePosition);
  }
  updatePosition();


// === Main Gemini 2.5 Flash Integration ===
    const askBtn = document.getElementById("askBtn");
    const responseDiv = document.getElementById("response");

    function parseModelJson(text) {
      if (!text) return { answer: "", quotes: [] };

      let trimmed = text.trim();
      try {
        return JSON.parse(trimmed);
      } catch {}

      trimmed = trimmed.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try {
        return JSON.parse(trimmed);
      } catch {}

      const firstBrace = trimmed.indexOf("{");
      const lastBrace = trimmed.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const slice = trimmed.slice(firstBrace, lastBrace + 1);
        try {
          return JSON.parse(slice);
        } catch {}
      }

      return { answer: text, quotes: [] };
    }

    askBtn.addEventListener("click", async () => {
  const question = document.getElementById("userInput").value.trim();
  if (!question) {
    responseDiv.textContent = "Please type a question first!";
    return;
  }

  responseDiv.textContent = "Analyzing page...";

  // Extract visible text
  const pageText = document.body?.innerText.slice(0, 8000) || "";

  // Get API key from background
  const { openaiKey: geminiKey } = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getAPIKey" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("[content] Message failed:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response || {});
    });
  });

  if (!geminiKey) {
    responseDiv.textContent = "⚠️ Please set your Gemini API key in the popup first.";
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    
    // ✅ Ask Gemini for both an answer and supporting quotes
   /* const prompt = `Answer the user's question **in plain text only** (no JSON or markdown).
Base your answer strictly on the webpage context below.


Context from webpage:
${pageText}

User question: ${question}

CRITICAL FORMAT RULES:
- Respond ONLY with raw JSON (no backticks, no code fences, no extra text).
- Do not include a "json" key or any markdown.
`;
*/

    const prompt = `
    Answer the user's question **in plain text only** (no JSON or markdown).
    Base your answer strictly on the webpage context below.

    Context:
    ${pageText}

    Question:
    ${question}
    `;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt//`You are a helpful assistant that answers questions about the webpage content.\n\nContext:\n${pageText}\n\nQuestion:\n${question}`
            }
          ]
        }
      ]
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (data.error) {
      responseDiv.textContent = `Error: ${data.error.message}`;
      console.error(data.error);
      return;
    } 

    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = parseModelJson(raw);

    // Prefer parsed.answer if present, otherwise raw text
    let clean = (parsed.answer ?? raw ?? "").trim();

    // Unescape newlines if model sent them as \n
    clean = clean.replace(/\\n/g, "\n");

    // Render nicely (bullets, bold names, highlighted dates)
    responseDiv.innerHTML = formatResponse(clean);
    /*dates?.[0]?.content?.parts?.[0]?.text || "";
    const parsed = parseModelJson(raw);

    responseDiv.textContent = (parsed.answer || "").trim() || "No answer from Gemini.";*/

  } catch (err) {
    console.error(err);
    responseDiv.textContent = "❌ Failed to reach Gemini API.";
  }
});

//Summarize Logic
const summarizeBtn = document.getElementById("summarizeBtn");

summarizeBtn.addEventListener("click", async () => {
  responseDiv.textContent = "Summarizing page...";

  // Extract visible text (limit to ~10k chars)
  const pageText = document.body?.innerText.slice(0, 10000) || "";

  // Fetch the Gemini API key
  const { openaiKey: geminiKey } = await new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "getAPIKey" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("[content] Message failed:", chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response || {});
    });
  });

  if (!geminiKey) {
    responseDiv.textContent = "⚠️ Please set your Gemini API key in the popup first.";
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const prompt = `
You are a helpful assistant that summarizes webpages clearly and concisely.

Summarize the main points of the following webpage in 5 concise bullet points.
If there are names, dates, or figures, include them.
Use plain text with • bullets.

Webpage text:
${pageText}
`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    if (data.error) {
      responseDiv.textContent = `Error: ${data.error.message}`;
      console.error(data.error);
      return;
    }

    const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    responseDiv.innerHTML = formatResponse(summary); //Calling Format Response

  } catch (err) {
    console.error(err);
    responseDiv.textContent = "❌ Failed to fetch summary.";
  }
});

function formatResponse(text) {
  if (!text) return "";

  let t = text.trim();

  // Normalize line breaks and bullets
  t = t.replace(/\r\n/g, "\n").replace(/\n\n+/g, "\n");
  t = t.replace(/^[•*-]\s+/gm, "• ");
  
  // Split into list items
  const bullets = t.split(/\n\s*•\s+/).map((b, i) => (i === 0 ? b : "• " + b));

  // Build HTML list
  const htmlList = bullets
    .map((b) => {
      // Bold key companies and names
      let line = b
        .replace(/\b(Tesla|Apple|Google|Microsoft|Amazon)\b/g, "<strong>$1</strong>")
        .replace(/\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, "<strong>$&</strong>")
        .replace(/\b\d{4}\b/g, '<span class="response-highlight">$&</span>')
        .replace(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b/g,
          '<span class="response-highlight">$&</span>');
      return `<li>${line}</li>`;
    })
    .join("");

  return `<ul class="response-list">${htmlList}</ul>`;
}


}
