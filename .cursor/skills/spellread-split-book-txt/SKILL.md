---
name: spellread-split-book-txt
description: >-
  Split a full-book TXT in content/txt/ into per-chapter files under
  content/txt/bookN/chapter-NN.txt. Use when preparing chapter source text,
  splitting Harry Potter book TXT, or setting up content for spellread-chapter-content.
---

# Split Book TXT into Chapters

Split one full-book text file into per-chapter files for SpellRead content work.

## Input / output

| | Path |
|---|------|
| **Source** | `content/txt/<book-title>.txt` (single file, full book) |
| **Output dir** | `content/txt/bookN/` |
| **Output files** | `chapter-01.txt` … `chapter-17.txt` (zero-padded chapter) |

Example for Book 1:

```
content/txt/Harry Potter and the Philosophers Stone.txt
  → content/txt/book1/chapter-01.txt
  → content/txt/book1/chapter-02.txt
  → …
  → content/txt/book1/chapter-17.txt
```

Book folders use `bookN` (no zero padding): `book1`, `book2`, …

Each output file includes the chapter heading line (e.g. `1. THE BOY WHO LIVED`) and all prose through the line before the next chapter heading.

## When to run

- Before authoring or auditing chapter JSON with `spellread-chapter-content`
- After adding or replacing a full-book TXT in `content/txt/`
- When the user asks to split, slice, or prepare per-chapter source text

## How to split

Run from the **spellread repo root**:

```bash
node scripts/split-book-txt.mjs --book 1
```

Optional explicit source:

```bash
node scripts/split-book-txt.mjs --book 1 --source "content/txt/Harry Potter and the Philosophers Stone.txt"
```

The script:

1. Locates chapter headings (`N. TITLE IN CAPS`) using the known Book 1 title list
2. Ignores false positives (e.g. numbered Hogwarts supply list inside Ch.5)
3. Creates `content/txt/bookN/` if missing
4. Writes one `chapter-NN.txt` per chapter

## Book 1 chapter headings (source TXT)

| Ch | Heading line |
|----|----------------|
| 1 | `1. THE BOY WHO LIVED` |
| 2 | `2. THE VANISHING GLASS` |
| 3 | `3. THE LETTERS FROM NO ONE` |
| 4 | `4. THE KEEPER OF THE KEYS` |
| 5 | `5. DIAGON ALLEY` |
| 6 | `6. THE JOURNEY FROM PLATFORM NINE AND THREE QUARTERS` |
| 7 | `7. THE SORTING HAT` |
| 8 | `8. THE POTIONS MASTER` |
| 9 | `9. THE MIDNIGHT DUEL` |
| 10 | `10. HALLOWEEN` |
| 11 | `11. QUIDDITCH` |
| 12 | `12. THE MIRROR OF ERISED` |
| 13 | `13. NICOLAS FLAMEL` |
| 14 | `14. NORBERT THE NORWEGIAN RIDGEBACK` |
| 15 | `15. THE FORBIDDEN FOREST` |
| 16 | `16. THROUGH THE TRAPDOOR` |
| 17 | `17. THE MAN WITH TWO FACES` |

## Adding another book

1. Add the chapter title list to `BOOK_CHAPTERS` in `scripts/split-book-txt.mjs`
2. Run `node scripts/split-book-txt.mjs --book <N> --source "content/txt/<file>.txt"`  
   Output goes to `content/txt/book<N>/`

## Verify after split

- Output directory contains the expected number of files (17 for Book 1)
- Open `chapter-01.txt` — starts with `1. THE BOY WHO LIVED`
- Open `chapter-02.txt` — starts with `2. THE VANISHING GLASS`; does not include Ch.1 body
- Last file `chapter-17.txt` runs to end of source book

Report file count and paths when done.

## Related

- Chapter JSON authoring: `spellread-chapter-content` skill  
  - Reads `content/txt/bookN/chapter-NN.txt`  
  - Writes `content/bookN/chapter-NN.json`
