import type { ChapterContent, ClozePassage, QuizDraft, QuizQuestion, QuizSectionId } from "@/types";

export const QUIZ_SECTION_ORDER: QuizSectionId[] = ["comprehension", "vocabulary", "cloze"];

export function getActiveQuizSections(content: ChapterContent): QuizSectionId[] {
  const hasCloze = Boolean(content.quiz.cloze && content.quiz.cloze.gaps.length > 0);
  return hasCloze ? QUIZ_SECTION_ORDER : QUIZ_SECTION_ORDER.slice(0, 2);
}

export function isQuizSectionComplete(
  id: QuizSectionId,
  compQuestions: QuizQuestion[],
  vocabQuestions: QuizQuestion[],
  clozePassage: ClozePassage | undefined,
  answers: Record<string, string>,
  clozeAnswers: Record<number, string>,
  clozeSubmitted: boolean,
): boolean {
  if (id === "comprehension") {
    return compQuestions.length > 0 && compQuestions.every((q) => answers[q.id]);
  }
  if (id === "vocabulary") {
    return vocabQuestions.length > 0 && vocabQuestions.every((q) => answers[q.id]);
  }
  if (id === "cloze" && clozePassage) {
    return (
      clozeSubmitted &&
      clozePassage.gaps.every((g) => (clozeAnswers[g.id] ?? "").trim().length > 0)
    );
  }
  return false;
}

export function computeCompletedQuizSections(
  activeSections: QuizSectionId[],
  compQuestions: QuizQuestion[],
  vocabQuestions: QuizQuestion[],
  clozePassage: ClozePassage | undefined,
  answers: Record<string, string>,
  clozeAnswers: Record<number, string>,
  clozeSubmitted: boolean,
): QuizSectionId[] {
  return activeSections.filter((id) =>
    isQuizSectionComplete(
      id,
      compQuestions,
      vocabQuestions,
      clozePassage,
      answers,
      clozeAnswers,
      clozeSubmitted,
    ),
  );
}

export function countCompletedQuizSections(
  activeSections: QuizSectionId[],
  completedSections: QuizSectionId[],
): number {
  return activeSections.filter((id) => completedSections.includes(id)).length;
}

export function buildQuizDraft(
  activeSections: QuizSectionId[],
  compQuestions: QuizQuestion[],
  vocabQuestions: QuizQuestion[],
  clozePassage: ClozePassage | undefined,
  answers: Record<string, string>,
  clozeAnswers: Record<number, string>,
  clozeSubmitted: boolean,
  attemptSeed: number,
): QuizDraft {
  return {
    answers,
    clozeAnswers,
    clozeSubmitted,
    completedSections: computeCompletedQuizSections(
      activeSections,
      compQuestions,
      vocabQuestions,
      clozePassage,
      answers,
      clozeAnswers,
      clozeSubmitted,
    ),
    attemptSeed,
  };
}

export const EMPTY_QUIZ_DRAFT: QuizDraft = {
  answers: {},
  clozeAnswers: {},
  clozeSubmitted: false,
  completedSections: [],
  attemptSeed: 0,
};
