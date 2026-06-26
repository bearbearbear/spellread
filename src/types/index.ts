export type VocabTier = 1 | 2 | 3;

export type VocabStatus = "new" | "learning" | "reviewing" | "mastered";

export type ChapterStatus =
  | "locked"
  | "preview_available"
  | "reading"
  | "quiz_pending"
  | "completed";

export type ReaderLevel =
  | "apprentice"
  | "prefect"
  | "head_boy"
  | "head_girl";

export type QuestionType =
  | "main_idea"
  | "detail"
  | "inference"
  | "emotion"
  | "sequence"
  | "definition"
  | "context_cloze"
  | "synonym"
  | "word_form"
  | "listening";

export interface VocabularyItem {
  /** Dictionary form shown on flashcards: verb infinitive, noun singular */
  word: string;
  tier: VocabTier;
  partOfSpeech: string;
  definition: string;
  /** Chinese gloss shown on flashcard back; falls back to `definition` if omitted */
  definitionZh?: string;
  example: string;
  /** Surface form as it appears in `example` when different from `word` (e.g. winked → wink) */
  formInText?: string;
  pageHint: string;
  grammarTip?: string;
}

export interface Character {
  name: string;
  description: string;
}

export interface BackgroundGuide {
  characters: Character[];
  hook: string;
  readingFocus: string;
}

export type ClozeGapType = "vocabulary" | "plot" | "grammar";

export interface ClozeGap {
  id: number;
  answer: string;
  acceptAlternatives?: string[];
  gapType: ClozeGapType;
  relatedWord?: string;
  explanation: string;
  pageHint?: string;
  partOfSpeech?: string;
}

export interface ClozePassage {
  id: string;
  title: string;
  paragraphs: string[];
  gaps: ClozeGap[];
  wordBank?: string[];
  guidedMode?: boolean;
  openMode?: boolean;
}

export type QuizSectionId = "comprehension" | "vocabulary" | "cloze";

export interface QuizDraft {
  answers: Record<string, string>;
  clozeAnswers: Record<number, string>;
  clozeSubmitted: boolean;
  completedSections: QuizSectionId[];
  attemptSeed: number;
}

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  category: "comprehension" | "vocabulary";
  stem: string;
  options: QuizOption[];
  correctId: string;
  explanation: string;
  pageHint?: string;
  relatedWord?: string;
}

export interface MiniCheckQuestion {
  id: string;
  word: string;
  stem: string;
  options: QuizOption[];
  correctId: string;
}

export interface ChapterContent {
  book: number;
  chapter: number;
  title: string;
  lexile: number;
  estimatedMinutes: number;
  estimatedWords: number;
  vocabulary: VocabularyItem[];
  background: BackgroundGuide;
  miniCheck: MiniCheckQuestion[];
  quiz: {
    comprehension: QuizQuestion[];
    vocabulary: QuizQuestion[];
    cloze?: ClozePassage;
  };
}

export interface BookMeta {
  id: number;
  title: string;
  subtitle: string;
  lexile: number;
  cefr: string;
  chapterCount: number;
  chapters: { number: number; title: string }[];
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar: string;
  house: "gryffindor" | "hufflepuff" | "ravenclaw" | "slytherin";
  readerLevel: ReaderLevel;
  lexileEstimate: number;
  housePoints: number;
  streakDays: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  parentPin?: string;
  placementDone: boolean;
  vocabLevel: number;
  comprehensionLevel: number;
  clozeLevel: number;
  readingStamina: number;
}

export interface QuizResultSummary {
  score: number;
  passed: boolean;
  comprehensionCorrect: number;
  comprehensionTotal: number;
  vocabularyCorrect: number;
  vocabularyTotal: number;
  clozeCorrect: number;
  clozeTotal: number;
  completedAt: string;
}

export interface ChapterProgress {
  book: number;
  chapter: number;
  status: ChapterStatus;
  previewCompleted: boolean;
  readingCompleted: boolean;
  wordsLearned: string[];
  readingMinutes: number;
  bookmarkPage?: number;
  quizAttempts: QuizAttempt[];
  quizDraft?: QuizDraft;
  lastQuizResult?: QuizResultSummary;
  bestScore?: number;
  completedAt?: string;
}

export interface QuizAttempt {
  date: string;
  score: number;
  passed: boolean;
  wrongQuestionIds: string[];
  comprehensionCorrect: number;
  comprehensionTotal: number;
  vocabularyCorrect: number;
  vocabularyTotal: number;
  clozeCorrect: number;
  clozeTotal: number;
}

export interface VocabEntry {
  word: string;
  book: number;
  chapter: number;
  status: VocabStatus;
  easeFactor: number;
  intervalDays: number;
  nextReview: string;
  wrongCount: number;
  source: "preview" | "quiz" | "manual";
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earnedAt?: string;
}

export interface AppState {
  profile: UserProfile | null;
  chapterProgress: Record<string, ChapterProgress>;
  vocabJournal: Record<string, VocabEntry>;
  badges: Badge[];
  recentQuizScores: number[];
  debugMode: boolean;
}

/** Per-learner persisted data (schema v2) */
export interface UserSave {
  profile: UserProfile;
  chapterProgress: Record<string, ChapterProgress>;
  vocabJournal: Record<string, VocabEntry>;
  badges: Badge[];
  recentQuizScores: number[];
  createdAt: string;
  updatedAt: string;
}

/** Device-level persistence root (localStorage spellread-v2) */
export interface DeviceState {
  schemaVersion: number;
  activeUserId: string | null;
  debugMode: boolean;
  users: Record<string, UserSave>;
  userOrder: string[];
}

export const DEVICE_SCHEMA_VERSION = 2;

export const PASS_THRESHOLD = 0.8;
export const POINTS = {
  preview: 10,
  reading: 20,
  quizPass: 30,
  perfect: 10,
} as const;
