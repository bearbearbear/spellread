import type { MiniCheckQuestion, QuizOption, QuizQuestion } from "@/types";

/** Fisher-Yates shuffle with optional seeded PRNG for reproducible quiz sessions */
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const copy = [...array];
  let s = seed ?? ((Math.random() * 0x7fffffff) | 0);

  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

export function shuffleOptions(options: QuizOption[], seed?: number): QuizOption[] {
  return shuffleArray(options, seed);
}

/** Shuffle option display order; correctId stays tied to option id, not position */
export function withShuffledOptions<Q extends { options: QuizOption[]; correctId: string }>(
  question: Q,
  seed?: number,
): Q {
  return {
    ...question,
    options: shuffleOptions(question.options, seed),
  };
}

export function shuffleQuizQuestions(questions: QuizQuestion[], baseSeed?: number): QuizQuestion[] {
  return questions.map((q, i) =>
    withShuffledOptions(q, baseSeed !== undefined ? baseSeed + i * 7919 : undefined),
  );
}

export function shuffleMiniCheckQuestions(
  questions: MiniCheckQuestion[],
  baseSeed?: number,
): MiniCheckQuestion[] {
  return questions.map((q, i) =>
    withShuffledOptions(q, baseSeed !== undefined ? baseSeed + i * 7919 : undefined),
  );
}

/** Shuffle plain string options for placement; returns shuffled list (correct value unchanged) */
export function shuffleStringOptions(
  correct: string,
  options: string[],
  seed?: number,
): string[] {
  const unique = [...new Set(options.length > 0 ? options : [correct])];
  if (!unique.includes(correct)) unique.unshift(correct);
  return shuffleArray(unique, seed);
}
