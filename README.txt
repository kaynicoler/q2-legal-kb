Q2 Legal Knowledge Base - repaired hybrid PDF import build

Replace the files in the root of the GitHub repository with this package.
Important: index.html and app.js must both be uploaded. The application JavaScript was moved out of the oversized inline HTML script so the browser can load all controls reliably.

Required project files:
- index.html
- app.js
- package.json
- netlify.toml
- netlify/functions/upload-pdf.mjs
- netlify/functions/get-pdf.mjs

Do not upload node_modules.
After committing, wait for the Netlify deploy to show Published, then press Ctrl+F5.
