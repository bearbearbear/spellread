import type { ChapterContent, ClozeGap, ClozePassage, UserProfile } from "@/types";

export function normalizeClozeAnswer(value: string): string {
  return value.trim().toLowerCase();
}

export function isGapCorrect(gap: ClozeGap, answer: string | undefined): boolean {
  if (!answer) return false;
  const normalized = normalizeClozeAnswer(answer);
  const accepted = [gap.answer, ...(gap.acceptAlternatives ?? [])].map(normalizeClozeAnswer);
  return accepted.includes(normalized);
}

export function scoreClozePassage(
  passage: ClozePassage,
  answers: Record<number, string>,
): { correct: number; total: number; wrongGapIds: number[] } {
  let correct = 0;
  const wrongGapIds: number[] = [];

  for (const gap of passage.gaps) {
    if (isGapCorrect(gap, answers[gap.id])) {
      correct++;
    } else {
      wrongGapIds.push(gap.id);
    }
  }

  return { correct, total: passage.gaps.length, wrongGapIds };
}

export function shouldUseGuidedCloze(
  profile: UserProfile,
  content: ChapterContent,
  passage: ClozePassage,
): boolean {
  if (passage.guidedMode === false) return false;
  if (passage.guidedMode === true && passage.openMode === false) return true;

  if (content.lexile < 900 || profile.vocabLevel < 0.6) return true;
  if (profile.clozeLevel < 0.5) return true;
  return false;
}

export function renderClozeParagraph(paragraph: string): { text: string; gapId: number | null }[] {
  const parts: { text: string; gapId: number | null }[] = [];
  const pattern = /\((\d+)\)\s*___/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(paragraph)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: paragraph.slice(lastIndex, match.index), gapId: null });
    }
    parts.push({ text: "", gapId: Number(match[1]) });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < paragraph.length) {
    parts.push({ text: paragraph.slice(lastIndex), gapId: null });
  }

  return parts;
}
