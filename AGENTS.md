# SpellRead

Vite + React + TypeScript reading companion app.

## Stack

- Vite 6, React 19, React Router 7
- Tailwind CSS 4 via `@tailwindcss/vite`
- Chapter content in `content/book1/*.json`

## Commands

```bash
npm run dev      # http://localhost:3001
npm run build    # output to dist/
npm run qa:content
```

## Structure

- `src/pages/` — route components
- `src/components/` — UI and learning components
- `src/lib/` — store, adaptive engine, SRS
