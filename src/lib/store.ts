
import type {
  AppState,
  Badge,
  ChapterProgress,
  ChapterStatus,
  QuizAttempt,
  QuizDraft,
  QuizResultSummary,
  UserProfile,
} from "@/types";
import { POINTS } from "@/types";
import { chapterKey, isTestChapter } from "./content";
import { createVocabEntry, scheduleReview, vocabKey } from "./srs";
import { updateProfileAfterQuiz } from "./adaptive";

const STORAGE_KEY = "spellread-state";

const DEFAULT_BADGES: Badge[] = [
  { id: "first_chapter", name: "First Steps", description: "Complete your first chapter" },
  { id: "streak_7", name: "Week Warrior", description: "Read 7 days in a row" },
  { id: "book_complete", name: "Stone Scholar", description: "Finish Book 1" },
  { id: "vocab_100", name: "Word Wizard", description: "Master 100 vocabulary words" },
  { id: "perfect_quiz", name: "Perfect Spell", description: "Score 100% on a chapter quiz" },
];

const BOOK1_CHAPTER_COUNT = 17;

function quizResultFromAttempts(progress: ChapterProgress): QuizResultSummary | undefined {
  if (progress.status !== "completed") return undefined;
  const lastPassed = [...progress.quizAttempts].reverse().find((a) => a.passed);
  if (!lastPassed) return undefined;
  return {
    score: lastPassed.score,
    passed: lastPassed.passed,
    comprehensionCorrect: lastPassed.comprehensionCorrect,
    comprehensionTotal: lastPassed.comprehensionTotal,
    vocabularyCorrect: lastPassed.vocabularyCorrect,
    vocabularyTotal: lastPassed.vocabularyTotal,
    clozeCorrect: lastPassed.clozeCorrect,
    clozeTotal: lastPassed.clozeTotal,
    completedAt: lastPassed.date,
  };
}

function defaultProgress(book: number, chapter: number): ChapterProgress {
  return {
    book,
    chapter,
    status: chapter === 1 ? "preview_available" : "locked",
    previewCompleted: false,
    readingCompleted: false,
    wordsLearned: [],
    readingMinutes: 0,
    quizAttempts: [],
  };
}

export function getDefaultState(): AppState {
  return {
    profile: null,
    chapterProgress: { "1-1": defaultProgress(1, 1) },
    vocabJournal: {},
    badges: DEFAULT_BADGES,
    recentQuizScores: [],
    debugMode: false,
  };
}

export function loadState(): AppState {
  if (typeof window === "undefined") return getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as AppState;
    const state = { ...getDefaultState(), ...parsed };

    if (state.profile && state.profile.clozeLevel === undefined) {
      state.profile = { ...state.profile, clozeLevel: 0.5 };
    }

    for (const [key, progress] of Object.entries(state.chapterProgress)) {
      const readingCompleted =
        progress.readingCompleted ??
        (progress.status === "quiz_pending" || progress.status === "completed");

      state.chapterProgress[key] = {
        ...progress,
        readingCompleted,
        lastQuizResult: progress.lastQuizResult ?? quizResultFromAttempts(progress),
        quizAttempts: progress.quizAttempts.map((a) => ({
          ...a,
          clozeCorrect: a.clozeCorrect ?? 0,
          clozeTotal: a.clozeTotal ?? 0,
        })),
      };
    }

    return state;
  } catch {
    return getDefaultState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createProfile(
  nickname: string,
  avatar: string,
  house: UserProfile["house"],
): UserProfile {
  const today = new Date().toISOString().split("T")[0];
  return {
    id: crypto.randomUUID(),
    nickname,
    avatar,
    house,
    readerLevel: "apprentice",
    lexileEstimate: 880,
    housePoints: 0,
    streakDays: 0,
    lastActiveDate: today,
    dailyGoalMinutes: 15,
    placementDone: false,
    vocabLevel: 0.5,
    comprehensionLevel: 0.5,
    clozeLevel: 0.5,
    readingStamina: 0.5,
  };
}

export function getChapterProgress(
  state: AppState,
  book: number,
  chapter: number,
): ChapterProgress {
  const key = chapterKey(book, chapter);
  const progress = state.chapterProgress[key] ?? defaultProgress(book, chapter);
  if (isTestChapter(chapter) && !state.debugMode) {
    return { ...progress, status: "locked" };
  }
  if (state.debugMode && progress.status === "locked") {
    return { ...progress, status: "preview_available" };
  }
  return progress;
}

/** Debug mode: unlock all Book 1 chapters (including Ch.0 sandbox) for testing */
export function setDebugMode(state: AppState, enabled: boolean): AppState {
  if (!enabled) {
    return { ...state, debugMode: false };
  }

  const chapterProgress = { ...state.chapterProgress };
  for (let ch = 0; ch <= BOOK1_CHAPTER_COUNT; ch++) {
    const key = chapterKey(1, ch);
    const existing = chapterProgress[key] ?? defaultProgress(1, ch);
    if (existing.status === "locked") {
      chapterProgress[key] = { ...existing, status: "preview_available" };
    }
  }

  return { ...state, debugMode: true, chapterProgress };
}

export function unlockNextChapter(state: AppState, book: number, chapter: number): AppState {
  if (isTestChapter(chapter)) return state;

  const nextKey = chapterKey(book, chapter + 1);
  const existing = state.chapterProgress[nextKey];
  if (existing && existing.status !== "locked") return state;

  return {
    ...state,
    chapterProgress: {
      ...state.chapterProgress,
      [nextKey]: {
        ...(existing ?? defaultProgress(book, chapter + 1)),
        status: "preview_available",
      },
    },
  };
}

export function completePreview(
  state: AppState,
  book: number,
  chapter: number,
  wordsLearned: string[],
): AppState {
  const key = chapterKey(book, chapter);
  const current = getChapterProgress(state, book, chapter);
  const journal = { ...state.vocabJournal };

  for (const word of wordsLearned) {
    const vk = vocabKey(word, book, chapter);
    if (!journal[vk]) {
      journal[vk] = createVocabEntry(word, book, chapter, "preview");
    }
  }

  let profile = state.profile;
  if (profile && !current.previewCompleted) {
    profile = { ...profile, housePoints: profile.housePoints + POINTS.preview };
  }

  let nextStatus: ChapterStatus = "reading";
  if (current.status === "completed") {
    nextStatus = "completed";
  } else if (current.readingCompleted && current.status === "quiz_pending") {
    nextStatus = "quiz_pending";
  }

  return {
    ...state,
    profile,
    vocabJournal: journal,
    chapterProgress: {
      ...state.chapterProgress,
      [key]: {
        ...current,
        status: nextStatus,
        previewCompleted: true,
        wordsLearned,
      },
    },
  };
}

export function completeReading(
  state: AppState,
  book: number,
  chapter: number,
  minutes: number,
  bookmarkPage?: number,
): AppState {
  const key = chapterKey(book, chapter);
  const current = getChapterProgress(state, book, chapter);

  let profile = state.profile;
  if (profile && !current.readingCompleted) {
    profile = {
      ...profile,
      housePoints: profile.housePoints + POINTS.reading,
      readingStamina: Math.min(1, profile.readingStamina * 0.8 + (minutes / 30) * 0.2),
    };
  }

  const nextStatus: ChapterStatus =
    current.status === "completed" || current.lastQuizResult?.passed === true
      ? "completed"
      : "quiz_pending";

  return {
    ...state,
    profile,
    chapterProgress: {
      ...state.chapterProgress,
      [key]: {
        ...current,
        status: nextStatus,
        readingCompleted: true,
        readingMinutes: minutes,
        bookmarkPage,
      },
    },
  };
}

export function saveQuizDraft(
  state: AppState,
  book: number,
  chapter: number,
  draft: QuizDraft,
): AppState {
  const key = chapterKey(book, chapter);
  const current = getChapterProgress(state, book, chapter);

  return {
    ...state,
    chapterProgress: {
      ...state.chapterProgress,
      [key]: {
        ...current,
        quizDraft: draft,
      },
    },
  };
}

export function clearQuizDraft(state: AppState, book: number, chapter: number): AppState {
  const key = chapterKey(book, chapter);
  const current = getChapterProgress(state, book, chapter);
  const { quizDraft: _removed, ...rest } = current;

  return {
    ...state,
    chapterProgress: {
      ...state.chapterProgress,
      [key]: rest as ChapterProgress,
    },
  };
}

/** Reset Chapter 0 sandbox progress for repeated Reading / Quiz testing */
export function resetSandboxChapter(state: AppState, book: number): AppState {
  const key = chapterKey(book, 0);
  return {
    ...state,
    chapterProgress: {
      ...state.chapterProgress,
      [key]: {
        ...defaultProgress(book, 0),
        status: state.debugMode ? "preview_available" : "locked",
      },
    },
  };
}

/** Clear completed quiz so the learner can retake from scratch */
export function beginQuizRetake(state: AppState, book: number, chapter: number): AppState {
  const key = chapterKey(book, chapter);
  const current = getChapterProgress(state, book, chapter);
  const { quizDraft: _draft, lastQuizResult: _result, ...rest } = current;

  return {
    ...state,
    chapterProgress: {
      ...state.chapterProgress,
      [key]: {
        ...(rest as ChapterProgress),
        status: "quiz_pending",
        bestScore: undefined,
        completedAt: undefined,
        lastQuizResult: undefined,
      },
    },
  };
}

function awardBadge(badges: Badge[], id: string): Badge[] {
  return badges.map((b) =>
    b.id === id && !b.earnedAt ? { ...b, earnedAt: new Date().toISOString() } : b,
  );
}

export function submitQuiz(
  state: AppState,
  book: number,
  chapter: number,
  attempt: Omit<QuizAttempt, "date">,
  passThreshold: number,
): AppState {
  const key = chapterKey(book, chapter);
  const current = getChapterProgress(state, book, chapter);
  const fullAttempt: QuizAttempt = { ...attempt, date: new Date().toISOString() };

  const journal = { ...state.vocabJournal };
  for (const qId of attempt.wrongQuestionIds) {
    const word = qId.startsWith("v") ? extractWordFromQuestion(qId) : null;
    if (word) {
      const vk = vocabKey(word, book, chapter);
      journal[vk] = journal[vk] ?? createVocabEntry(word, book, chapter, "quiz");
    }
  }

  let profile = state.profile;
  let badges = [...state.badges];
  const recentScores = [...state.recentQuizScores, attempt.score];

  if (profile) {
    profile = updateProfileAfterQuiz(profile, attempt);
    if (attempt.passed) profile.housePoints += POINTS.quizPass;
    if (attempt.score >= 1) profile.housePoints += POINTS.perfect;
  }

  const newStatus: ChapterStatus = attempt.passed ? "completed" : "quiz_pending";
  const completedCount = Object.values(state.chapterProgress).filter(
    (p) => p.status === "completed" && !isTestChapter(p.chapter),
  ).length;

  if (attempt.passed && completedCount === 0 && !isTestChapter(chapter)) {
    badges = awardBadge(badges, "first_chapter");
  }
  if (attempt.score >= 1) {
    badges = awardBadge(badges, "perfect_quiz");
  }
  if (attempt.passed && chapter === 17) {
    badges = awardBadge(badges, "book_complete");
  }

  const masteredCount = Object.values(journal).filter((e) => e.status === "mastered").length;
  if (masteredCount >= 100) {
    badges = awardBadge(badges, "vocab_100");
  }

  const lastQuizResult: QuizResultSummary | undefined = attempt.passed
    ? {
        score: attempt.score,
        passed: attempt.passed,
        comprehensionCorrect: attempt.comprehensionCorrect,
        comprehensionTotal: attempt.comprehensionTotal,
        vocabularyCorrect: attempt.vocabularyCorrect,
        vocabularyTotal: attempt.vocabularyTotal,
        clozeCorrect: attempt.clozeCorrect,
        clozeTotal: attempt.clozeTotal,
        completedAt: fullAttempt.date,
      }
    : current.lastQuizResult;

  let newState: AppState = {
    ...state,
    profile,
    badges,
    vocabJournal: journal,
    recentQuizScores: recentScores.slice(-10),
    chapterProgress: {
      ...state.chapterProgress,
      [key]: {
        ...current,
        status: newStatus,
        quizAttempts: [...current.quizAttempts, fullAttempt],
        bestScore: Math.max(current.bestScore ?? 0, attempt.score),
        completedAt: attempt.passed ? new Date().toISOString() : current.completedAt,
        lastQuizResult,
      },
    },
  };

  if (attempt.passed && attempt.score >= passThreshold && !isTestChapter(chapter)) {
    newState = unlockNextChapter(newState, book, chapter);
  }

  return newState;
}

function extractWordFromQuestion(_qId: string): string | null {
  return null;
}

export function addVocabFromQuiz(
  state: AppState,
  word: string,
  book: number,
  chapter: number,
): AppState {
  const vk = vocabKey(word, book, chapter);
  if (state.vocabJournal[vk]) return state;

  return {
    ...state,
    vocabJournal: {
      ...state.vocabJournal,
      [vk]: createVocabEntry(word, book, chapter, "quiz"),
    },
  };
}

export function updateStreak(state: AppState): AppState {
  if (!state.profile) return state;

  const today = new Date().toISOString().split("T")[0];
  const last = state.profile.lastActiveDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let streak = state.profile.streakDays;
  if (last === today) return state;
  else if (last === yesterday) streak += 1;
  else streak = 1;

  let badges = state.badges;
  if (streak >= 7) {
    badges = awardBadge(badges, "streak_7");
  }

  return {
    ...state,
    badges,
    profile: { ...state.profile, streakDays: streak, lastActiveDate: today },
  };
}

export function reviewVocab(
  state: AppState,
  word: string,
  book: number,
  chapter: number,
  correct: boolean,
): AppState {
  const vk = vocabKey(word, book, chapter);
  const entry = state.vocabJournal[vk];
  if (!entry) return state;

  return {
    ...state,
    vocabJournal: {
      ...state.vocabJournal,
      [vk]: scheduleReview(entry, correct),
    },
  };
}

export function setPlacement(
  state: AppState,
  lexile: number,
  startChapter: number,
): AppState {
  if (!state.profile) return state;

  const progress: Record<string, ChapterProgress> = {};
  for (let ch = 1; ch <= 17; ch++) {
    progress[chapterKey(1, ch)] = {
      ...defaultProgress(1, ch),
      status: ch < startChapter ? "completed" : ch === startChapter ? "preview_available" : "locked",
      previewCompleted: ch < startChapter,
      readingCompleted: ch < startChapter,
      completedAt: ch < startChapter ? new Date().toISOString() : undefined,
      bestScore: ch < startChapter ? 1 : undefined,
    };
  }

  return {
    ...state,
    profile: {
      ...state.profile,
      lexileEstimate: lexile,
      placementDone: true,
    },
    chapterProgress: { ...state.chapterProgress, ...progress },
  };
}

export function getWeeklyReport(state: AppState) {
  const weekAgo = new Date(Date.now() - 7 * 86400000);

  const completed = Object.values(state.chapterProgress).filter(
    (p) => p.completedAt && new Date(p.completedAt) >= weekAgo,
  );

  const totalMinutes = Object.values(state.chapterProgress).reduce(
    (sum, p) => sum + p.readingMinutes,
    0,
  );

  const allAttempts = Object.values(state.chapterProgress).flatMap((p) => p.quizAttempts);
  const weekAttempts = allAttempts.filter((a) => new Date(a.date) >= weekAgo);
  const avgScore =
    weekAttempts.length > 0
      ? weekAttempts.reduce((s, a) => s + a.score, 0) / weekAttempts.length
      : 0;

  const weakComprehension = weekAttempts.filter(
    (a) => a.comprehensionCorrect / Math.max(a.comprehensionTotal, 1) < 0.6,
  ).length;
  const weakVocabulary = weekAttempts.filter(
    (a) => a.vocabularyCorrect / Math.max(a.vocabularyTotal, 1) < 0.6,
  ).length;
  const weakCloze = weekAttempts.filter(
    (a) => a.clozeTotal > 0 && a.clozeCorrect / a.clozeTotal < 0.6,
  ).length;

  const weakAreas =
    weakComprehension >= weakVocabulary && weakComprehension >= weakCloze
      ? "Reading comprehension"
      : weakVocabulary >= weakCloze
        ? "Vocabulary"
        : weakCloze > 0
          ? "Cloze passage"
          : "Balanced";

  return {
    chaptersCompleted: completed.length,
    totalReadingMinutes: totalMinutes,
    quizAttempts: weekAttempts.length,
    averageScore: Math.round(avgScore * 100),
    weakAreas,
    streakDays: state.profile?.streakDays ?? 0,
    housePoints: state.profile?.housePoints ?? 0,
  };
}
