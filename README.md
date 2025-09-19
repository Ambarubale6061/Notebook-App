# Notebook (Notes) App — Local HTML/CSS/JS

## What this project is
A single-page notebook (notes) app built with plain HTML, CSS and modern JavaScript.  
It includes:
- Signup & Login (client-side only, stored in `localStorage`).
- Notes CRUD (create, read, update, delete) stored per-user in `localStorage`.
- Search and sort, responsive layout, basic styling.

**Security note:** This app is for learning/demo only. Authentication is client-side and not secure. Do NOT use for sensitive data or production.

## Files
- `index.html` — main app
- `styles.css` — styling
- `app.js` — app logic (ES module)
- `README.md` — this file

## How to run
1. Download/unzip the project.
2. Open `index.html` in your browser (double-click or right-click → Open with...).
3. Create an account (signup), then login.
4. Add, edit, delete notes. Notes and accounts are stored in `localStorage` scoped to your browser.

## Development notes / Next steps (suggestions)
- Replace client-side auth with a backend (Node/Express + DB) for real accounts.
- Add sync / backup using a backend or Firebase.
- Add markdown support and export/import features.
- Improve UI/UX and add tests.

