# SpellRead Design System

Child-friendly UI guidelines for the Harry Potter reading companion.

## Visual Identity

- **Theme**: Original Hogwarts-inspired parchment aesthetic (no movie assets)
- **Palette**: Parchment backgrounds, burgundy primary actions, gold accents, forest green secondary
- **Texture**: Subtle gradient parchment cards with gold borders

## Typography

| Use | Font | Notes |
|-----|------|-------|
| Body | Lexend | Dyslexia-friendly, high legibility |
| Headings | Crimson Pro | Warm serif for magical feel |
| Minimum body size | 16px (1rem) | Children 7–14 |

## Touch Targets

- Minimum interactive size: **48×48px**
- Button padding: `px-6 py-3`
- Navigation items: `min-h-12 min-w-16`

## Components

| Component | Path | Purpose |
|-----------|------|---------|
| Button | `src/components/ui/Button.tsx` | Primary/secondary actions |
| ProgressBar | `src/components/ui/ProgressBar.tsx` | Chapter/word progress |
| VocabCard | `src/components/learning/VocabCard.tsx` | Vocabulary preview |
| QuizQuestion | `src/components/learning/QuizQuestion.tsx` | Quiz interaction (per section) |
| QuizSectionSummary | same | Section completion screen between comprehension and vocabulary |
| ChapterMap | `src/components/learning/ChapterMap.tsx` | Hogwarts-style progress map |
| BottomNav | `src/components/layout/BottomNav.tsx` | Home / Words / Review / Me |

## Accessibility

- WCAG 2.1 AA color contrast on text
- `focus-visible` gold outline (3px)
- `aria-label` on icon-only buttons
- TTS via Web Speech API for vocabulary
- `prefers-reduced-motion` respected
- Keyboard navigable quiz options

## House Colors

CSS classes: `.house-gryffindor`, `.house-hufflepuff`, `.house-ravenclaw`, `.house-slytherin`

## Do Not Use

- Warner Bros. official artwork
- Movie stills or character likenesses
- Dense text blocks (>3 sentences without break)
