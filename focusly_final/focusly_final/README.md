# ✦ Focusly — Task Management App

> A responsive, animated task manager built with React. Covers **Phase 1** (Core UI) and **Phase 2** (Enhancements & Deployment) in full.

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/focusly.git
cd focusly

# 2. Install dependencies
npm install

# 3. Run dev server
npm run dev
# → open http://localhost:5173
```

---

## ✅ Features — Phase 1

| Feature | Status |
|---|---|
| React project setup (Vite) | ✅ |
| Responsive header with logo | ✅ |
| Task input section | ✅ |
| Add new task (Enter / button) | ✅ |
| Mark task as complete | ✅ |
| Delete task | ✅ |
| State management with React Hooks | ✅ |
| localStorage persistence | ✅ |
| Responsive layout (mobile → desktop) | ✅ |

## ✅ Features — Phase 2

| Feature | Status |
|---|---|
| Filter tabs — All / Pending / Completed | ✅ |
| Task counters (stats row + progress ring) | ✅ |
| Edit task inline (double-click) | ✅ |
| Animations & transitions | ✅ |
| Empty states (context-aware) | ✅ |
| Loading spinner on submit | ✅ |
| Search tasks (live filter) | ✅ |
| Sort tasks (4 modes) | ✅ |
| Priority levels (Low / Normal / High) | ✅ |
| Toast notifications | ✅ |
| Clear completed (batch delete) | ✅ |
| Accessibility (ARIA labels, keyboard nav) | ✅ |
| Reduced-motion support | ✅ |

---

## 🗂 File Structure

```
focusly/
├── public/
│   └── vite.svg
├── src/
│   ├── App.jsx        ← entire application
│   └── main.jsx
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🛠 Tech Stack

- **React 18** — functional components + Hooks only
- **Vite** — dev server & production bundler
- **localStorage** — browser-native persistence (no backend)
- **CSS-in-JS** — inline styles + injected `<style>` tag (no external CSS framework needed)

---

## 📋 How to Use

| Action | How |
|---|---|
| Add task | Type in the input → press **Enter** or click **+** |
| Set priority | Click Low / Normal / High before adding |
| Complete task | Click the checkbox |
| Edit task | **Double-click** the task text |
| Delete task | Click **✕** |
| Filter | Click All / Pending / Completed tabs |
| Search | Type in the search bar |
| Sort | Use the dropdown (Newest / Oldest / Priority / A→Z) |
| Clear done | Click **Clear N completed** |

---

## 🏗 Component Architecture

```
App
├── Header         — logo, progress ring, stat cards
├── TaskInput      — input field + priority picker
├── SearchBar      — live full-text search
├── FilterBar      — All/Pending/Completed + sort
├── TaskItem[]     — individual task rows
├── EmptyState     — shown when list is empty
└── Toast          — auto-dismiss notification
```

---

## 🌐 Deployment

### Vercel (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Add New Project
3. Import the `focusly` repo (Vite auto-detected)
4. Click **Deploy** — live in ~60 seconds

### Netlify

1. Go to [netlify.com](https://netlify.com) → Add New Site
2. Connect GitHub → select `focusly`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Click **Deploy Site**

---

## 📦 Phase 1 Submission

- [x] GitHub repository with project setup
- [x] Working task management UI
- [x] Responsive design
- [x] Basic documentation (this README)

## 📦 Phase 2 Submission

- [x] Live deployed URL (Vercel/Netlify)
- [x] Final GitHub repository
- [x] UI/UX improvement report (see `Focusly_Documentation.docx`)
- [x] Final documentation

---

## 🎥 Demo Video

> **Phase 1 and 2 Demo:** (https://drive.google.com/file/d/103cel4Hj6IcFGM_WStKIKUgvmXY1ODbD/view?usp=sharing) <!-- Replace with your link -->

 <!-- Replace with your link -->

---

## 👤 Author

| | |
|---|---|
| Name | [Kanika] |

| Live URL | https://focusly-mocha.vercel.app |

---

*Built with ✦ React — Your tasks, your pace.*
