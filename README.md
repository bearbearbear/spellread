# SpellRead

A Harry Potter reading companion for children — preview vocabulary before each chapter, read your own book, and take comprehension + vocabulary quizzes after.

**Bring your own book.** SpellRead never hosts full chapter text.

## Features

- **Chapter Preview** — vocabulary cards with TTS, background guides, mini-check
- **Reading Timer** — track reading time with word lookup and bookmarks
- **Chapter Quiz** — comprehension + vocabulary in two sequential sections
- **Adaptive Engine** — adjusts word count, tier mix, hints, and pass threshold
- **Word Journal** — spaced repetition review queue
- **Parent Dashboard** — weekly report, difficulty adjustment, reading goals
- **Gamification** — House Points, badges, chapter progress map

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) (port 3001 to avoid conflicts with other local apps)

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run qa:content   # Validate all chapter content packs
node scripts/generate-chapters.mjs  # Regenerate chapters 2-17
```

## Project Structure

```
content/book1/          # Chapter JSON content packs (17 chapters)
src/app/                # Next.js pages
src/components/         # UI + learning components
src/lib/                # Store, adaptive engine, SRS, TTS
docs/                   # Copyright policy, design system, beta protocol
```

## Content Model

Each chapter JSON includes:

- `vocabulary` — tiered word list with definitions and short examples
- `background` — characters, hook, reading focus
- `miniCheck` — 3 optional pre-reading questions
- `quiz.comprehension` — 5–7 understanding questions
- `quiz.vocabulary` — 4–5 word training questions

## Copyright

See [docs/COPYRIGHT.md](docs/COPYRIGHT.md). This is a companion tool — users must own their own copy of the books.

## Beta Testing

See [docs/BETA_TEST.md](docs/BETA_TEST.md) for the family beta protocol and feedback collection.

## Tech Stack

- Next.js 16 + TypeScript
- Tailwind CSS 4
- LocalStorage for MVP persistence
- Web Speech API for pronunciation

## License

MIT (application code). Harry Potter content references are for educational companion use only.
