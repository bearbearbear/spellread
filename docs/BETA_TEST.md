# SpellRead Beta Test Protocol

## Overview

Closed beta with **10–20 families** reading Harry Potter Book 1 using SpellRead as a companion tool.

**Duration:** 3 weeks  
**Target:** Children aged 7–14 with their own copy of *Philosopher's Stone*

## Recruitment Criteria

- Child has started or is about to start Book 1
- Parent willing to complete weekly feedback
- Device with modern browser (Chrome, Safari, Edge)
- Own physical book, Kindle, or library ebook

## Onboarding Families

1. Share link to local/dev deployment or hosted preview
2. Parent completes consent checkbox with child during onboarding
3. Assign each family a **Family ID** (e.g. `Family-A01`) for tracking
4. Ask families to read 2–3 chapters per week minimum

## Metrics to Track

| Metric | Source | MVP Target |
|--------|--------|------------|
| Chapter completion rate | `UserChapterProgress` | ≥ 65% |
| Quiz first-pass rate | `QuizAttempt.passed` | ≥ 55% |
| Quiz abandonment | Started quiz but no submit | < 20% |
| Avg frustration (survey) | Parent feedback form | ≤ 2.5 / 5 |
| Child enjoyment (survey) | Parent feedback form | ≥ 3.5 / 5 |
| 7-day retention | Return visits within 7 days | ≥ 35% |

## Weekly Parent Survey

Use `/parent/feedback` or the questions below:

1. How many chapters did your child complete this week?
2. Quiz completion: Always / Sometimes / Rarely
3. Frustration level (1–5)
4. Child enjoyment (1–5)
5. Open comments: vocabulary too hard? quiz too long? UI confusing?

## Exit Interview (Week 3)

- Would you continue using SpellRead for Book 2?
- What feature mattered most: preview, quiz, word journal, or map?
- NPS: Would you recommend to another family? (0–10)

## Iteration Triggers

| Signal | Action |
|--------|--------|
| Quiz pass rate < 45% | Lower pass threshold to 70%; add more hints |
| Frustration ≥ 3.5 | Shorten quizzes to 10 questions; soften failure copy |
| Preview skip rate high | Make mini-check optional (already is); reduce word count |
| Low retention | Add push/email reminders (V1.1); improve streak UI |

## Exporting Feedback (MVP)

Feedback stored in `localStorage` key `spellread-feedback`. Export via browser console:

```javascript
JSON.parse(localStorage.getItem('spellread-feedback'))
```

## QA Checklist Before Beta

- [ ] All 17 chapters load preview + quiz
- [ ] Chapter unlock chain works after 80% pass
- [ ] Word journal populates from preview + wrong answers
- [ ] SRS review shows due words
- [ ] Parent dashboard shows weekly stats
- [ ] Copyright disclaimer visible on onboarding + footer
- [ ] No full chapter text displayed anywhere

## Post-Beta Deliverables

1. Summary report: completion rates, survey aggregates
2. Prioritized bug/enhancement list
3. Go/no-go decision for Book 2 content
