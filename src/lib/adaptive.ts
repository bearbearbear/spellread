import type { ChapterContent, ReaderLevel, UserProfile, VocabTier, VocabularyItem } from "@/types";
import { shuffleQuizQuestions } from "@/lib/shuffle-options";

export interface AdaptiveSettings {
  vocabCount: number;
  tierWeights: Record<VocabTier, number>;
  passThreshold: number;
  showExtraHints: boolean;
  recommendedBook: number;
  recommendedChapter: number;
}

const LEVEL_THRESHOLDS: { level: ReaderLevel; minLexile: number }[] = [
  { level: "head_boy", minLexile: 1000 },
  { level: "head_girl", minLexile: 1000 },
  { level: "prefect", minLexile: 920 },
  { level: "apprentice", minLexile: 0 },
];

export function lexileToReaderLevel(lexile: number, house: UserProfile["house"]): ReaderLevel {
  if (lexile >= 1000) {
    return house === "gryffindor" || house === "slytherin" ? "head_boy" : "head_girl";
  }
  if (lexile >= 920) return "prefect";
  return "apprentice";
}

export function readerLevelLabel(level: ReaderLevel): string {
  const labels: Record<ReaderLevel, string> = {
    apprentice: "Apprentice Reader",
    prefect: "Prefect Reader",
    head_boy: "Head Boy Reader",
    head_girl: "Head Girl Reader",
  };
  return labels[level];
}

export function computeAdaptiveSettings(
  profile: UserProfile,
  recentScores: number[],
): AdaptiveSettings {
  const avgRecent =
    recentScores.length > 0
      ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
      : 0.7;

  const lastThree = recentScores.slice(-3);
  const streakHigh = lastThree.length === 3 && lastThree.every((s) => s >= 0.9);
  const struggling = recentScores.length > 0 && avgRecent < 0.6;

  let vocabCount = 12;
  let tierWeights: Record<VocabTier, number> = { 1: 0.3, 2: 0.5, 3: 0.2 };
  let passThreshold = 0.8;
  let showExtraHints = false;

  if (streakHigh) {
    vocabCount = 15;
    tierWeights = { 1: 0.15, 2: 0.45, 3: 0.4 };
  } else if (struggling) {
    vocabCount = 8;
    tierWeights = { 1: 0.5, 2: 0.4, 3: 0.1 };
    passThreshold = 0.7;
    showExtraHints = true;
  } else if (avgRecent >= 0.6 && avgRecent < 0.8) {
    vocabCount = 10;
  }

  if (profile.vocabLevel < 0.5) {
    tierWeights = { 1: 0.5, 2: 0.35, 3: 0.15 };
    vocabCount = Math.min(vocabCount, 10);
  }

  if (profile.comprehensionLevel < 0.5) {
    showExtraHints = true;
  }

  const lexile = profile.lexileEstimate;
  let recommendedBook = 1;
  let recommendedChapter = 1;

  if (lexile >= 940) {
    recommendedBook = 2;
    recommendedChapter = 1;
  } else if (lexile >= 900) {
    recommendedBook = 1;
    recommendedChapter = Math.min(17, Math.floor((lexile - 860) / 5) + 1);
  }

  return {
    vocabCount,
    tierWeights,
    passThreshold,
    showExtraHints,
    recommendedBook,
    recommendedChapter,
  };
}

export function selectVocabularyForUser(
  allVocab: VocabularyItem[],
  settings: AdaptiveSettings,
): VocabularyItem[] {
  const scored = allVocab.map((v) => ({
    item: v,
    weight: settings.tierWeights[v.tier],
  }));

  scored.sort((a, b) => b.weight - a.weight);

  const selected = scored.slice(0, settings.vocabCount).map((s) => s.item);

  const tier1Missing = selected.filter((v) => v.tier === 1).length === 0;
  if (tier1Missing && settings.tierWeights[1] > 0.2) {
    const tier1 = allVocab.find((v) => v.tier === 1 && !selected.includes(v));
    if (tier1) {
      selected.pop();
      selected.push(tier1);
    }
  }

  return selected;
}

export function updateProfileAfterQuiz(
  profile: UserProfile,
  attempt: {
    score: number;
    comprehensionCorrect: number;
    comprehensionTotal: number;
    vocabularyCorrect: number;
    vocabularyTotal: number;
  },
): UserProfile {
  const compRate =
    attempt.comprehensionTotal > 0
      ? attempt.comprehensionCorrect / attempt.comprehensionTotal
      : profile.comprehensionLevel;
  const vocabRate =
    attempt.vocabularyTotal > 0
      ? attempt.vocabularyCorrect / attempt.vocabularyTotal
      : profile.vocabLevel;

  const newComp = profile.comprehensionLevel * 0.7 + compRate * 0.3;
  const newVocab = profile.vocabLevel * 0.7 + vocabRate * 0.3;

  let lexile = profile.lexileEstimate;
  if (attempt.score >= 0.9) lexile += 5;
  else if (attempt.score < 0.6) lexile -= 5;
  lexile = Math.max(800, Math.min(1100, lexile));

  return {
    ...profile,
    comprehensionLevel: newComp,
    vocabLevel: newVocab,
    lexileEstimate: lexile,
    readerLevel: lexileToReaderLevel(lexile, profile.house),
  };
}

export function placementRecommendation(
  vocabScore: number,
  comprehensionScore: number,
): { book: number; chapter: number; lexile: number } {
  const total = (vocabScore + comprehensionScore) / 2;

  if (total >= 0.85) return { book: 1, chapter: 5, lexile: 900 };
  if (total >= 0.65) return { book: 1, chapter: 1, lexile: 880 };
  return { book: 1, chapter: 1, lexile: 860 };
}

export function buildQuizSet(
  content: ChapterContent,
  seed?: number,
): { comprehension: typeof content.quiz.comprehension; vocabulary: typeof content.quiz.vocabulary } {
  const shuffle = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    let s = seed ?? Date.now();
    for (let i = copy.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const baseSeed = seed !== undefined ? seed * 1000 : undefined;

  return {
    comprehension: shuffleQuizQuestions(shuffle(content.quiz.comprehension), baseSeed),
    vocabulary: shuffleQuizQuestions(
      shuffle(content.quiz.vocabulary),
      baseSeed !== undefined ? baseSeed + 500 : undefined,
    ),
  };
}
