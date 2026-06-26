---
name: spellread-chapter-content
description: >-
  Author SpellRead chapter JSON from per-chapter TXT: read
  content/txt/bookN/chapter-NN.txt, write content/bookN/chapter-NN.json
  with vocabulary, comprehension, and cloze quizzes, then verify against that
  chapter file before finishing. Use when rewriting chapter content, generating
  vocabulary, quiz questions, auditing content vs the book, or editing
  content/book1/chapter-*.json. Do not use scripts to process the text.
---

# SpellRead Chapter Content Authoring

Each run works on **one chapter**: read one TXT, write one JSON.

| Role | Path pattern | Example (Book 1, Ch.2) |
|------|----------------|-------------------------|
| **Source (read)** | `content/txt/bookN/chapter-NN.txt` | `content/txt/book1/chapter-02.txt` |
| **Output (write)** | `content/bookN/chapter-NN.json` | `content/book1/chapter-02.json` |

- `N` = book number (`1`, `2`, …) — **no zero padding** in folder names
- `NN` = zero-padded chapter number (`01` … `17`)

**Gold standard:** `content/book1/chapter-01.json`  
**Schema:** [reference.md](reference.md)

**Never** copy `scripts/generate-chapters.mjs` generic templates.

**Prerequisite:** Chapter TXT must exist. If `content/txt/bookN/` is missing, run the `spellread-split-book-txt` skill first.

**How to work:** Open **only** this chapter's TXT file and read it directly. Quote from what you read. Do not write scripts or use the full-book TXT when a per-chapter file exists.

---

## Workflow

```
- [ ] 1. Read content/txt/bookN/chapter-NN.txt
- [ ] 2. Pick 12 vocabulary items (verbatim examples from that file)
- [ ] 3. Write background + miniCheck (3)
- [ ] 4. Write comprehension (7) + vocabulary quiz (5) + cloze (7 gaps)
- [ ] 5. Re-read the same chapter TXT and verify every item
- [ ] 6. Write content/bookN/chapter-NN.json — fix failures until clean
```

One chapter per pass. Verify before moving on.

---

## Step 1 — Read the chapter TXT

### Source file (this chapter only)

```
content/txt/bookN/chapter-NN.txt
```

Examples:

| Book | Chapter | Read this file |
|------|---------|----------------|
| 1 | 1 | `content/txt/book1/chapter-01.txt` |
| 1 | 12 | `content/txt/book1/chapter-12.txt` |
| 2 | 3 | `content/txt/book2/chapter-03.txt` |

The file already contains **only** that chapter's text. It starts with the chapter heading, e.g.:

```
2. THE VANISHING GLASS
```

You do **not** need to find chapter boundaries or skip content from other chapters.

### Chapter titles (for JSON `title` field)

| Ch | JSON `title` |
|----|--------------|
| 1 | The Boy Who Lived |
| 2 | The Vanishing Glass |
| 3 | The Letters from No One |
| 4 | The Keeper of the Keys |
| 5 | Diagon Alley |
| 6 | The Journey from Platform Nine and Three-Quarters |
| 7 | The Sorting Hat |
| 8 | The Potions Master |
| 9 | The Midnight Duel |
| 10 | Halloween |
| 11 | Quidditch |
| 12 | The Mirror of Erised |
| 13 | Nicolas Flamel |
| 14 | Norbert the Norwegian Ridgeback |
| 15 | The Forbidden Forest |
| 16 | Through the Trapdoor |
| 17 | The Man with Two Faces |

**Before choosing words:** Read the **entire** `chapter-NN.txt` once. Note key scenes, characters, and sentences that teach a word in context.

---

## Step 2 — Vocabulary (12 items)

| Tier | When to use |
|------|-------------|
| 1 | High-frequency, concrete (whisper, scar, famous) |
| 2 | Story/academic (peculiar, mysterious, rejoice) |
| 3 | HP-specific (Muggle, Hogwarts, Quidditch) |

For each item:

1. The word **or an inflected form** **appears in this chapter TXT**.
2. `word` = **dictionary form** shown on the flashcard front:
   - **verbs** → infinitive without *to* (`wink`, not `winked`; `vanish`, not `vanished`)
   - **nouns** → singular (`cloak`, not `cloaks`; `tantrum`, not `tantrums`)
   - **adjectives / adverbs** → base form (`miserable`, `forbidden`)
3. `example` = **verbatim copy** from `chapter-NN.txt` — do not paraphrase.  
   The sentence may use an inflected form (`winked`, `cloaks`); that is fine.  
   Shorten only at a natural clause boundary if the sentence is very long.  
   Minor punctuation variants (`—` vs `-`, straight vs curly quotes) are OK if wording is unchanged.
4. `formInText` — **required when** the exact substring in `example` differs from `word`  
   (e.g. `word`: `wink`, `formInText`: `winked`). Copy the surface form exactly as it appears in the quote.  
   Omit when `word` appears as-is in `example`.
5. Child-friendly English `definition`.
6. `pageHint` — printed book page if known, else `"early in chapter"` / scene hint.

All examples must come from the **same** `chapter-NN.txt` you read in Step 1.

`quiz.*.relatedWord` and `miniCheck.word` must match the vocabulary `word` (dictionary form), not `formInText`.  
Cloze gap `answer` may stay as the form used in the chapter text; set `relatedWord` to the vocabulary `word`.

---

## Step 3 — Background + miniCheck

- `background.characters`: 3–5 people active **in this chapter**.
- `hook`: 1–2 sentences; no spoilers beyond this chapter.
- `readingFocus`: what to notice while reading.
- `miniCheck`: 3 short definition checks on preview vocab.

---

## Step 4 — Quiz

### Comprehension × 7

| ID | Type | Focus |
|----|------|-------|
| c1 | main_idea | Whole chapter |
| c2–c4 | detail | Specific facts from the text |
| c5 | emotion or inference | Reactions / why |
| c6–c7 | inference or detail | Cause-effect, key event |

- Correct answers must be **supported by this chapter TXT**.
- Distractors plausible but wrong for **this** chapter.

### Vocabulary × 5

Mix `definition`, `context_cloze`, `synonym`.  
Stems echo **book phrasing**. Every `relatedWord` must appear in this chapter TXT.

### Cloze × 7 gaps

- 2–3 paragraphs summarizing the chapter (summary may paraphrase; **gap answers must not**).
- Each `answer` (or `acceptAlternatives`) must appear in this chapter TXT.
- `wordBank`: 7 answers + 3–5 distractors from the vocab list.
- ≥4 gaps: `gapType: "vocabulary"` with `relatedWord` from the chapter list.

---

## Step 5 — Verify (mandatory)

After drafting JSON, **re-open the same** `content/txt/bookN/chapter-NN.txt` and check every item.

### Vocabulary (all 12)

| Check | Pass criteria |
|-------|---------------|
| Dictionary form | Verbs = infinitive; nouns = singular |
| Word in chapter | `word` or `formInText` appears in the chapter TXT |
| Example exact | `example` is a contiguous quote from that file |
| Highlight form | If `formInText` is set, it is an exact substring of `example` |
| Same file | Quote is not from a different chapter file |

### Quiz — vocabulary

Each `relatedWord` appears in the chapter TXT.

### Quiz — cloze

Each gap `answer` and `acceptAlternatives` appears in the chapter TXT.

### Quiz — comprehension

Each **correct** option matches a fact or event in this chapter TXT.

### Verification report (required before done)

```markdown
## Book N · Ch.N verification

Source: content/txt/bookN/chapter-NN.txt
Output: content/bookN/chapter-NN.json

| Word | In chapter TXT | Example matches text | Notes |
|------|----------------|----------------------|-------|
| peculiar | ✓ | ✓ | |

Comprehension c1–c7: reviewed ✓
Cloze gaps 1–7: all answers in chapter TXT ✓
```

**Any failure → fix JSON → re-read chapter TXT and verify again.**

---

## Step 6 — Final pass

- [ ] Flashcard `word` fields use dictionary form; `formInText` set where example inflects
- [ ] Examples read well on flashcards
- [ ] No spoilers from later chapters
- [ ] Cloze reads coherently
- [ ] JSON `title` matches chapter map; `book` and `chapter` numbers match paths
- [ ] Top-level fields preserved: `book`, `chapter`, `title`, `lexile`, `estimatedMinutes`, `estimatedWords`

---

## Output

Write to: `content/bookN/chapter-NN.json` (zero-padded chapter, e.g. `chapter-02.json`)

Set `"book": N` and `"chapter": N` to match the book/chapter you are authoring.

Product rules: `docs/PRODUCT_DESIGN.md` §4.2, §4.4.

## Related

- Split full book → per-chapter TXT: `spellread-split-book-txt` skill
