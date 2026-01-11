🧠 Sticky AI — On-Page AI Assistant

Sticky AI is a lightweight, draggable Chrome extension that acts as an AI-powered sticky note on any webpage. It analyzes the visible content of the current page and provides context-aware answers, summaries, and calculations without leaving the page.
The goal of Sticky AI is to reduce context switching, speed up understanding of complex pages, and improve productivity through inline AI assistance.

✨ Features
📝 Ask About This Page
Ask natural language questions grounded strictly in the visible content of the webpage.
📌 Summarize Page
One-click summarization of long articles, SOPs, or documentation into concise bullet points.
🧠 Context-Grounded Responses
Responses are generated using only the current page’s content to reduce hallucinations.
🖱️ Draggable Sticky UI
A movable, non-intrusive overlay that stays on top of any webpage.
⏱️ Utility Use Cases
Can be extended to handle tasks like time-card calculations, document extraction, and data interpretation.
🎨 Clean & Modern UI
Compact design with highlighted key dates, names, and figures for readability.

🧩 Example Use Cases

1.) Summarizing internal knowledge base or SOP pages
2.) Explaining complex dashboards or internal tools
3.) Calculating worked hours from time-card data
4.) Extracting key information from documents
5.) Speeding up onboarding and training
6.) Reducing repeated support or clarification requests

🛠️ Tech Stack

Chrome Extension (Manifest V3)
JavaScript
HTML / CSS
Google Gemini 2.5 Flash API
Content Scripts + Background Service Worker

⚙️ How It Works

User opens Sticky AI on any webpage
The extension extracts visible page text
The text is sent to the AI model along with the user’s question or summarize prompt
The AI returns a grounded response
Results are displayed in a styled, scrollable sticky note overlay

🔐 API Key Setup

Sticky AI currently requires a Gemini API key.
Get a Gemini API key from Google AI Studio
Open the extension popup
Click Set API Key
Paste your key (stored locally using Chrome storage)

🔒 Note: API keys are stored locally and never hardcoded in the extension.
🚀 Installation (Local Development)

Clone this repository:
git clone https://github.com/your-username/sticky-ai.git


Open Chrome and navigate to:
chrome://extensions


Enable Developer Mode (top-right)
Click Load unpacked and select the project folder
The Sticky AI icon will appear in your Chrome toolbar

🧪 Current Status
✅ Fully working prototype
✅ Ask & Summarize features implemented
🚧 Inline page highlighting (experimental)
🚧 Backend proxy for shared API access (planned)

📈 Future Enhancements
Inline highlighting of source sentences on the page
Backend proxy for shared enterprise usage
User role-based behavior (Ops, IT, Training, etc.)
Copy/export summaries
Organization-specific AI grounding
Accessibility and dark mode support

🤝 Contributing

This project is currently experimental, but contributions and suggestions are welcome.
Feel free to open issues or submit pull requests.
