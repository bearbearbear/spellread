import type { VocabEntry, VocabStatus } from "@/types";

const MS_PER_DAY = 86400000;

export function vocabKey(word: string, book: number, chapter: number): string {
  return `${book}-${chapter}-${word.toLowerCase()}`;
}

export function createVocabEntry(
  word: string,
  book: number,
  chapter: number,
  source: VocabEntry["source"],
): VocabEntry {
  const today = new Date().toISOString().split("T")[0];
  return {
    word,
    book,
    chapter,
    status: "new",
    easeFactor: 2.5,
    intervalDays: 0,
    nextReview: today,
    wrongCount: 0,
    source,
  };
}

export function scheduleReview(entry: VocabEntry, correct: boolean): VocabEntry {
  const today = new Date();
  let { easeFactor, intervalDays, wrongCount, status } = entry;

  if (correct) {
    wrongCount = 0;
    if (intervalDays === 0) intervalDays = 1;
    else if (intervalDays === 1) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);

    easeFactor = Math.min(3.0, easeFactor + 0.1);

    if (intervalDays >= 21) status = "mastered";
    else if (intervalDays >= 3) status = "reviewing";
    else status = "learning";
  } else {
    wrongCount += 1;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    status = "learning";
  }

  const next = new Date(today.getTime() + intervalDays * MS_PER_DAY);

  return {
    ...entry,
    easeFactor,
    intervalDays,
    wrongCount,
    status,
    nextReview: next.toISOString().split("T")[0],
  };
}

export function getDueVocab(
  journal: Record<string, VocabEntry>,
  limit = 10,
): VocabEntry[] {
  const today = new Date().toISOString().split("T")[0];

  return Object.values(journal)
    .filter((e) => e.status !== "mastered" && e.nextReview <= today)
    .sort((a, b) => {
      const priority: Record<VocabStatus, number> = {
        new: 0,
        learning: 1,
        reviewing: 2,
        mastered: 3,
      };
      return priority[a.status] - priority[b.status];
    })
    .slice(0, limit);
}

export function countByStatus(journal: Record<string, VocabEntry>): Record<VocabStatus, number> {
  const counts: Record<VocabStatus, number> = {
    new: 0,
    learning: 0,
    reviewing: 0,
    mastered: 0,
  };

  for (const entry of Object.values(journal)) {
    counts[entry.status]++;
  }

  return counts;
}
