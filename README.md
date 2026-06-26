# SpellRead

A Harry Potter reading companion for children — preview vocabulary before each chapter, read your own book, and take comprehension + vocabulary quizzes after.

**Bring your own book.** SpellRead never hosts full chapter text.

## Features

- **Chapter Preview** — vocabulary cards with TTS, background guides, mini-check
- **Reading Timer** — track reading time with word lookup and bookmarks
- **Chapter Quiz** — two sections (comprehension + vocabulary), 80% to pass
- **Adaptive Engine** — adjusts word count, tier mix, hints, and pass threshold
- **Word Journal** — spaced repetition review queue
- **Parent Dashboard** — weekly report, difficulty adjustment, reading goals
- **Gamification** — House Points, badges, chapter progress map

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Live Site

[https://bearbearbear.github.io/spellread/](https://bearbearbear.github.io/spellread/)

Pushes to `main` deploy automatically via GitHub Pages.

## Scripts

```bash
npm run dev          # Vite dev server (port 3001)
npm run build        # Production build → dist/
npm run preview      # Preview production build
npm run qa:content   # Validate all chapter content packs
```

## Tech Stack

- **Vite** + React 19 + TypeScript
- **React Router** for client-side routing
- **Tailwind CSS 4** via `@tailwindcss/vite`
- LocalStorage for MVP persistence
- Web Speech API for pronunciation

## Project Structure

```
content/book1/          # Chapter JSON content packs (17 chapters)
src/pages/              # Route pages
src/components/         # UI + learning components
src/lib/                # Store, adaptive engine, SRS, TTS
docs/                   # Product design, multi-user spec, copyright, beta protocol
```

## License

MIT (application code). Harry Potter content references are for educational companion use only.
