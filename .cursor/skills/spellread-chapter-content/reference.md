# Chapter JSON schema (SpellRead)

Gold-standard reference: `content/book1/chapter-01.json`

## Source ↔ output paths

| | Pattern | Book 1, Ch.3 example |
|---|---------|----------------------|
| **Read** | `content/txt/bookN/chapter-NN.txt` | `content/txt/book1/chapter-03.txt` |
| **Write** | `content/bookN/chapter-NN.json` | `content/book1/chapter-03.json` |

Book folders use `bookN` (no zero padding). Chapter files use `chapter-NN` (zero-padded).

Work from the per-chapter TXT only — not the full-book file in `content/txt/`.

## Counts per chapter

| Section | Count | Notes |
|---------|-------|-------|
| `vocabulary` | 12 | Mix tier 1–3; all from this chapter TXT |
| `miniCheck` | 3 | Quick checks on 3 preview words |
| `quiz.comprehension` | 7 | main_idea, detail, inference, emotion |
| `quiz.vocabulary` | 5 | definition, context_cloze, synonym |
| `quiz.cloze` | 7 gaps | 2–3 paragraphs; ≥60% from `vocabulary` |

## Vocabulary item

```json
{
  "word": "wink",
  "tier": 1,
  "partOfSpeech": "verb",
  "definition": "to close one eye briefly as a signal or joke",
  "example": "It winked.",
  "formInText": "winked",
  "pageHint": "reptile house",
  "grammarTip": "optional — only if useful"
}
```

**Rules**
- `word` = **dictionary form** on the flashcard front: verb infinitive (`wink`), noun singular (`cloak`)
- `example` = verbatim substring of `content/txt/bookN/chapter-NN.txt` (may use inflected forms)
- `formInText` = exact surface form in `example` when it differs from `word`; omit when they match
- `pageHint`: book page when known, else scene hint
- `quiz.*.relatedWord` / `miniCheck.word` → always the vocabulary `word`, not `formInText`

## Comprehension question

```json
{
  "id": "c1",
  "type": "main_idea",
  "category": "comprehension",
  "stem": "What is this chapter mainly about?",
  "options": [
    { "id": "a", "text": "..." },
    { "id": "b", "text": "..." },
    { "id": "c", "text": "..." },
    { "id": "d", "text": "..." }
  ],
  "correctId": "a",
  "explanation": "One sentence citing chapter evidence.",
  "pageHint": "p. 4"
}
```

**Types**: `main_idea`, `detail`, `inference`, `emotion`, `sequence`

## Vocabulary quiz question

```json
{
  "id": "v1",
  "type": "definition",
  "category": "vocabulary",
  "stem": "In this chapter, 'peculiar' means —",
  "options": [ ... ],
  "correctId": "a",
  "explanation": "...",
  "relatedWord": "peculiar"
}
```

**Types**: `definition`, `context_cloze`, `synonym`, `word_form`

## Cloze passage

```json
{
  "id": "cloze-ch01",
  "title": "The Boy Who Lived",
  "paragraphs": ["Sentence with (1) ___ gap ..."],
  "gaps": [
    {
      "id": 1,
      "answer": "normal",
      "acceptAlternatives": [],
      "gapType": "vocabulary",
      "relatedWord": "normal",
      "explanation": "...",
      "pageHint": "p. 1"
    }
  ],
  "wordBank": ["..."],
  "guidedMode": true,
  "openMode": true
}
```

`gapType`: `vocabulary` | `plot` | `grammar`

## Tier guide

| Tier | Examples |
|------|----------|
| 1 | whisper, scar, famous |
| 2 | peculiar, mysterious, rejoice |
| 3 | Muggle, Hogwarts, Quidditch |

## Background

```json
{
  "characters": [{ "name": "...", "description": "one line" }],
  "hook": "2 sentences, this chapter only",
  "readingFocus": "What to watch for while reading"
}
```
