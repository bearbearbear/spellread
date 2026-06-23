
import { useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getChapter } from "@/lib/content";
import { submitQuiz, addVocabFromQuiz, saveQuizDraft, clearQuizDraft, getChapterProgress, beginQuizRetake } from "@/lib/store";
import { computeAdaptiveSettings, buildQuizSet } from "@/lib/adaptive";
import { scoreClozePassage, shouldUseGuidedCloze } from "@/lib/cloze";
import {
  getActiveQuizSections,
  isQuizSectionComplete,
  buildQuizDraft,
} from "@/lib/quiz-progress";
import {
  QuizQuestionView,
  QUIZ_SECTIONS,
  type QuizSectionId,
} from "@/components/learning/QuizQuestion";
import { ClozePassageView } from "@/components/learning/ClozePassageView";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import type { ClozePassage, QuizQuestion, QuizResultSummary } from "@/types";
import { POINTS } from "@/types";
import { useChapterParams } from "@/hooks/useChapterParams";

type QuizPhase = "overview" | "comprehension" | "vocabulary" | "cloze" | "results";

interface SectionScore {
  correct: number;
  total: number;
}

function scoreSection(questions: QuizQuestion[], answers: Record<string, string>): SectionScore {
  let correct = 0;
  for (const q of questions) {
    if (answers[q.id] === q.correctId) correct++;
  }
  return { correct, total: questions.length };
}

function sectionScoresFromResult(
  result: QuizResultSummary,
): Record<QuizSectionId, SectionScore> {
  return {
    comprehension: {
      correct: result.comprehensionCorrect,
      total: result.comprehensionTotal,
    },
    vocabulary: {
      correct: result.vocabularyCorrect,
      total: result.vocabularyTotal,
    },
    cloze: {
      correct: result.clozeCorrect,
      total: result.clozeTotal,
    },
  };
}

export function QuizPage() {
  const { book, chapter } = useChapterParams();
  const navigate = useNavigate();
  const { state, setState } = useApp();
  const content = getChapter(book, chapter);
  const chapterProgress = getChapterProgress(state, book, chapter);
  const savedDraft = chapterProgress.quizDraft;
  const lastQuizResult = chapterProgress.lastQuizResult;
  const isChapterQuizPassed =
    chapterProgress.status === "completed" && lastQuizResult?.passed === true;

  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);
  const [attempt, setAttempt] = useState(savedDraft?.attemptSeed ?? 0);
  const [phase, setPhase] = useState<QuizPhase>("overview");
  const [qIndex, setQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>(savedDraft?.answers ?? {});
  const [clozeAnswers, setClozeAnswers] = useState<Record<number, string>>(
    savedDraft?.clozeAnswers ?? {},
  );
  const [clozeSubmitted, setClozeSubmitted] = useState(savedDraft?.clozeSubmitted ?? false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    comp: SectionScore;
    vocab: SectionScore;
    cloze: SectionScore;
  } | null>(null);

  const settings = useMemo(() => {
    if (!state.profile) return null;
    return computeAdaptiveSettings(state.profile, state.recentQuizScores);
  }, [state.profile, state.recentQuizScores]);

  const quizSet = useMemo(() => {
    if (!content) return { comprehension: [], vocabulary: [] };
    return buildQuizSet(content, chapter * 1000 + attempt);
  }, [content, chapter, attempt]);

  const clozePassage: ClozePassage | undefined = content?.quiz.cloze;
  const guidedCloze = useMemo(() => {
    if (!content || !clozePassage || !state.profile) return true;
    return shouldUseGuidedCloze(state.profile, content, clozePassage);
  }, [content, clozePassage, state.profile]);

  const compQuestions = quizSet.comprehension;
  const vocabQuestions = quizSet.vocabulary;
  const activeSections = content ? getActiveQuizSections(content) : [];

  const persistDraft = useCallback(
    (
      nextAnswers: Record<string, string>,
      nextClozeAnswers: Record<number, string>,
      nextClozeSubmitted: boolean,
      nextAttempt: number,
    ) => {
      if (!content) return;
      setState((prev) =>
        saveQuizDraft(
          prev,
          book,
          chapter,
          buildQuizDraft(
            activeSections,
            compQuestions,
            vocabQuestions,
            clozePassage,
            nextAnswers,
            nextClozeAnswers,
            nextClozeSubmitted,
            nextAttempt,
          ),
        ),
      );
    },
    [
      activeSections,
      book,
      chapter,
      clozePassage,
      compQuestions,
      content,
      setState,
      vocabQuestions,
    ],
  );

  const compScore = scoreSection(compQuestions, answers);
  const vocabScore = scoreSection(vocabQuestions, answers);
  const clozeScore = clozePassage
    ? clozeSubmitted
      ? scoreClozePassage(clozePassage, clozeAnswers)
      : { correct: 0, total: clozePassage.gaps.length }
    : { correct: 0, total: 0 };

  const sectionScores: Record<QuizSectionId, SectionScore> = {
    comprehension: compScore,
    vocabulary: vocabScore,
    cloze: { correct: clozeScore.correct, total: clozeScore.total },
  };

  const allSectionsComplete = activeSections.every((id) =>
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

  const overallCorrect = compScore.correct + vocabScore.correct + clozeScore.correct;
  const overallTotal = compScore.total + vocabScore.total + clozeScore.total;

  const returnToOverview = () => {
    setPhase("overview");
    setQIndex(0);
    setSelectedId(null);
    setSubmitted(false);
  };

  const enterSection = (id: QuizSectionId) => {
    if (id === "cloze") {
      const complete = isQuizSectionComplete(
        "cloze",
        compQuestions,
        vocabQuestions,
        clozePassage,
        answers,
        clozeAnswers,
        clozeSubmitted,
      );
      if (!complete) setClozeSubmitted(false);
      setPhase("cloze");
      return;
    }

    const questions = id === "comprehension" ? compQuestions : vocabQuestions;
    const resumeIndex = questions.findIndex((q) => !answers[q.id]);
    setPhase(id);
    setQIndex(resumeIndex === -1 ? 0 : resumeIndex);
    setSelectedId(null);
    setSubmitted(false);
  };

  const resetAttempt = () => {
    setPhase("overview");
    setQIndex(0);
    setSelectedId(null);
    setSubmitted(false);
    setAnswers({});
    setClozeAnswers({});
    setClozeSubmitted(false);
    setResult(null);
    setShowRetakeConfirm(false);
    setAttempt((a) => a + 1);
    setState((prev) => clearQuizDraft(prev, book, chapter));
  };

  const handleRetakeQuiz = () => {
    setState((prev) => beginQuizRetake(prev, book, chapter));
    setPhase("overview");
    setQIndex(0);
    setSelectedId(null);
    setSubmitted(false);
    setAnswers({});
    setClozeAnswers({});
    setClozeSubmitted(false);
    setResult(null);
    setShowRetakeConfirm(false);
    setAttempt((a) => a + 1);
  };

  const returnToOverviewWithDraft = (
    nextAnswers: Record<string, string>,
    nextClozeAnswers: Record<number, string>,
    nextClozeSubmitted: boolean,
  ) => {
    persistDraft(nextAnswers, nextClozeAnswers, nextClozeSubmitted, attempt);
    returnToOverview();
  };

  if (!content || !settings) return <p>Chapter not found.</p>;

  const passThreshold = settings.passThreshold;
  const activeSection: QuizSectionId | null =
    phase === "comprehension"
      ? "comprehension"
      : phase === "vocabulary"
        ? "vocabulary"
        : phase === "cloze"
          ? "cloze"
          : null;
  const activeQuestions =
    activeSection === "comprehension"
      ? compQuestions
      : activeSection === "vocabulary"
        ? vocabQuestions
        : [];
  const currentQ = activeQuestions[qIndex];

  const handleSubmit = () => {
    if (!selectedId || !currentQ) return;
    setSubmitted(true);
    const nextAnswers = { ...answers, [currentQ.id]: selectedId };
    setAnswers(nextAnswers);
    persistDraft(nextAnswers, clozeAnswers, clozeSubmitted, attempt);

    if (selectedId !== currentQ.correctId && currentQ.relatedWord) {
      setState((prev) => addVocabFromQuiz(prev, currentQ.relatedWord!, book, chapter));
    }
  };

  const finishQuiz = () => {
    const comp = scoreSection(compQuestions, answers);
    const vocab = scoreSection(vocabQuestions, answers);
    const cloze = clozePassage
      ? scoreClozePassage(clozePassage, clozeAnswers)
      : { correct: 0, total: 0, wrongGapIds: [] as number[] };

    const correct = comp.correct + vocab.correct + cloze.correct;
    const total = comp.total + vocab.total + cloze.total;
    const score = total > 0 ? correct / total : 0;
    const passed = score >= passThreshold;

    const wrongIds: string[] = [];
    for (const q of [...compQuestions, ...vocabQuestions]) {
      if (answers[q.id] !== q.correctId) wrongIds.push(q.id);
    }
    for (const gapId of cloze.wrongGapIds) {
      wrongIds.push(`cloze-g${gapId}`);
    }

    const wrongWords: string[] = [];
    if (clozePassage) {
      for (const gap of clozePassage.gaps) {
        if (cloze.wrongGapIds.includes(gap.id) && gap.relatedWord) {
          wrongWords.push(gap.relatedWord);
        }
      }
    }

    setState((prev) => {
      let next = prev;
      for (const word of wrongWords) {
        next = addVocabFromQuiz(next, word, book, chapter);
      }
      next = submitQuiz(
        next,
        book,
        chapter,
        {
          score,
          passed,
          wrongQuestionIds: wrongIds,
          comprehensionCorrect: comp.correct,
          comprehensionTotal: comp.total,
          vocabularyCorrect: vocab.correct,
          vocabularyTotal: vocab.total,
          clozeCorrect: cloze.correct,
          clozeTotal: cloze.total,
        },
        passThreshold,
      );
      return clearQuizDraft(next, book, chapter);
    });

    setResult({
      score,
      passed,
      correct,
      comp,
      vocab,
      cloze: { correct: cloze.correct, total: cloze.total },
    });
    setPhase("results");
  };

  const handleNext = () => {
    if (!currentQ) return;

    if (qIndex < activeQuestions.length - 1) {
      setQIndex((i) => i + 1);
      setSelectedId(null);
      setSubmitted(false);
      return;
    }

    const finalAnswers = { ...answers, [currentQ.id]: selectedId! };
    setAnswers(finalAnswers);
    returnToOverviewWithDraft(finalAnswers, clozeAnswers, clozeSubmitted);
  };

  const handleClozeSubmit = () => {
    if (!clozePassage) return;
    setClozeSubmitted(true);
    returnToOverviewWithDraft(answers, clozeAnswers, true);
  };

  // --- Overview (chapter already passed) ---
  if (phase === "overview" && isChapterQuizPassed && lastQuizResult) {
    const savedScores = sectionScoresFromResult(lastQuizResult);
    const savedTotal =
      lastQuizResult.comprehensionTotal +
      lastQuizResult.vocabularyTotal +
      lastQuizResult.clozeTotal;
    const savedCorrect =
      lastQuizResult.comprehensionCorrect +
      lastQuizResult.vocabularyCorrect +
      lastQuizResult.clozeCorrect;

    return (
      <div className="space-y-6">
        <div>
          <Link
            to={`/book/${book}/chapter/${chapter}/overview`}
            className="text-sm text-ink-muted hover:underline"
          >
            ← Back to overview
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Chapter Quiz</h1>
          <p className="text-ink-muted">{content.title}</p>
        </div>

        <div className="parchment-card border-success/30 bg-success/5 p-6 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-2 text-xl font-bold">Quiz Passed!</h2>
          <p className="mt-1 text-lg text-burgundy">
            {Math.round(lastQuizResult.score * 100)}% ({savedCorrect}/{savedTotal})
          </p>
          <p className="mt-2 text-sm text-ink-muted">
            You can re-read anytime. Your quiz score stays here until you choose to retake.
          </p>
        </div>

        <div className="space-y-3">
          {activeSections.map((id, i) => {
            const meta = QUIZ_SECTIONS[id];
            const score = savedScores[id];
            const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

            return (
              <div
                key={id}
                className="parchment-card flex items-center gap-4 p-4 opacity-95"
              >
                <div className="text-3xl">{meta.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    Section {i + 1}: {meta.title}
                    <span className="ml-2 text-success">✓</span>
                  </p>
                  <p className="text-sm text-ink-muted">{meta.subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-burgundy">
                    {score.correct}/{score.total}
                  </p>
                  <p className="text-xs text-ink-muted">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>

        {showRetakeConfirm ? (
          <div className="parchment-card space-y-4 border-warning/40 p-4">
            <p className="font-semibold text-warning">Retake this quiz?</p>
            <p className="text-sm text-ink-muted">
              This will clear your previous quiz score and remove this chapter&apos;s completed
              status. You will need to pass again to keep the chapter marked complete.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={() => setShowRetakeConfirm(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleRetakeQuiz} className="flex-1">
                Yes, Retake Quiz
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <Button variant="secondary" onClick={() => setShowRetakeConfirm(true)} className="w-full">
              Retake Quiz
            </Button>
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Map →
            </Button>
          </div>
        )}
      </div>
    );
  }

  // --- Overview (active quiz) ---
  if (phase === "overview") {
    return (
      <div className="space-y-6">
        <div>
          <Link
            to={`/book/${book}/chapter/${chapter}/overview`}
            className="text-sm text-ink-muted hover:underline"
          >
            ← Back to overview
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Chapter Quiz</h1>
          <p className="text-ink-muted">{content.title}</p>
        </div>

        <p className="text-ink-muted">
          Tap any section to begin. Complete all {activeSections.length} sections, then submit. You need{" "}
          {Math.round(passThreshold * 100)}% overall to pass.
        </p>

        {overallTotal > 0 && (
          <div className="parchment-card p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-ink-muted">Overall progress</span>
              <span className="font-semibold text-burgundy">
                {overallCorrect}/{overallTotal}
              </span>
            </div>
            <ProgressBar value={overallCorrect} max={overallTotal} label="Quiz score so far" />
          </div>
        )}

        <div className="space-y-3">
          {activeSections.map((id, i) => {
            const meta = QUIZ_SECTIONS[id];
            const score = sectionScores[id];
            const complete = isQuizSectionComplete(
              id,
              compQuestions,
              vocabQuestions,
              clozePassage,
              answers,
              clozeAnswers,
              clozeSubmitted,
            );
            const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

            return (
              <button
                key={id}
                type="button"
                onClick={() => enterSection(id)}
                className="parchment-card flex w-full items-center gap-4 p-4 text-left transition-colors hover:border-gold hover:bg-white/40"
              >
                <div className="text-3xl">{meta.icon}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    Section {i + 1}: {meta.title}
                    {complete && <span className="ml-2 text-success">✓</span>}
                  </p>
                  <p className="text-sm text-ink-muted">{meta.subtitle}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold text-burgundy">
                    {score.correct}/{score.total}
                  </p>
                  <p className="text-xs text-ink-muted">{pct}%</p>
                </div>
              </button>
            );
          })}
        </div>

        {allSectionsComplete && (
          <Button onClick={finishQuiz} className="w-full">
            Submit Quiz →
          </Button>
        )}
      </div>
    );
  }

  // --- Cloze section ---
  if (phase === "cloze" && clozePassage) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={returnToOverview}
            className="text-sm text-ink-muted hover:underline"
          >
            ← Back to Quiz
          </button>
          <h1 className="mt-2 text-2xl font-bold">
            {QUIZ_SECTIONS.cloze.icon} Section 3: {QUIZ_SECTIONS.cloze.title}
          </h1>
          <p className="text-ink-muted">{content.title}</p>
        </div>

        <ProgressBar
          value={Object.keys(clozeAnswers).filter((k) => clozeAnswers[Number(k)]?.trim()).length}
          max={clozePassage.gaps.length}
          label="Cloze progress"
        />

        <ClozePassageView
          passage={clozePassage}
          guided={guidedCloze}
          answers={clozeAnswers}
          submitted={clozeSubmitted}
          showHints={settings.showExtraHints}
          onChangeAnswer={(gapId, value) => {
            const nextClozeAnswers = { ...clozeAnswers, [gapId]: value };
            setClozeAnswers(nextClozeAnswers);
            persistDraft(answers, nextClozeAnswers, clozeSubmitted, attempt);
          }}
          onSubmit={handleClozeSubmit}
        />
      </div>
    );
  }

  // --- Final results ---
  if (phase === "results" && result) {
    const compPct = result.comp.total > 0 ? Math.round((result.comp.correct / result.comp.total) * 100) : 0;
    const vocabPct = result.vocab.total > 0 ? Math.round((result.vocab.correct / result.vocab.total) * 100) : 0;
    const clozePct = result.cloze.total > 0 ? Math.round((result.cloze.correct / result.cloze.total) * 100) : 0;
    const totalQuestions = result.comp.total + result.vocab.total + result.cloze.total;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl">{result.passed ? "🎉" : "📚"}</div>
          <h1 className="text-3xl font-bold">
            {result.passed ? "Chapter Complete!" : "Keep Practicing!"}
          </h1>
          <p className="mt-2 text-xl">
            Overall: {Math.round(result.score * 100)}% ({result.correct}/{totalQuestions})
          </p>
          <p className="text-ink-muted">
            {result.passed
              ? `You passed! Need ${Math.round(passThreshold * 100)}% overall to unlock the next chapter.`
              : `You need ${Math.round(passThreshold * 100)}% overall. Review your book and try again!`}
          </p>
          {result.passed && (
            <p className="mt-2 font-semibold text-gold">+{POINTS.quizPass} House Points!</p>
          )}
        </div>

        <div className={`grid gap-3 ${result.cloze.total > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
          <div className="parchment-card p-4 text-center">
            <p className="text-sm text-ink-muted">📖 Comp</p>
            <p className="text-2xl font-bold text-burgundy">
              {result.comp.correct}/{result.comp.total}
            </p>
            <p className="text-sm">{compPct}%</p>
          </div>
          <div className="parchment-card p-4 text-center">
            <p className="text-sm text-ink-muted">✨ Vocab</p>
            <p className="text-2xl font-bold text-burgundy">
              {result.vocab.correct}/{result.vocab.total}
            </p>
            <p className="text-sm">{vocabPct}%</p>
          </div>
          {result.cloze.total > 0 && (
            <div className="parchment-card p-4 text-center">
              <p className="text-sm text-ink-muted">📝 Cloze</p>
              <p className="text-2xl font-bold text-burgundy">
                {result.cloze.correct}/{result.cloze.total}
              </p>
              <p className="text-sm">{clozePct}%</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {result.passed ? (
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Map →
            </Button>
          ) : (
            <>
              <Button onClick={resetAttempt} className="w-full">
                Try Again
              </Button>
              <Link to={`/book/${book}/chapter/${chapter}/read`}>
                <Button variant="secondary" className="w-full">Re-read Chapter</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // --- Active MCQ section ---
  if (!currentQ || !activeSection) return <p>No quiz questions.</p>;

  const sectionMeta = QUIZ_SECTIONS[activeSection];
  const sectionNumber =
    activeSection === "comprehension" ? 1 : activeSection === "vocabulary" ? 2 : 3;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={returnToOverview}
          className="text-sm text-ink-muted hover:underline"
        >
          ← Back to Quiz
        </button>
        <h1 className="mt-2 text-2xl font-bold">
          {sectionMeta.icon} Section {sectionNumber}: {sectionMeta.title}
        </h1>
        <p className="text-ink-muted">{content.title}</p>
      </div>

      <ProgressBar
        value={qIndex + (submitted ? 1 : 0)}
        max={activeQuestions.length}
        label={`${sectionMeta.title} progress`}
      />

      <QuizQuestionView
        question={currentQ}
        index={qIndex}
        total={activeQuestions.length}
        section={activeSection}
        selectedId={selectedId}
        submitted={submitted}
        onSelect={setSelectedId}
        onSubmit={handleSubmit}
        showHints={settings.showExtraHints}
      />

      {submitted && (
        <Button onClick={handleNext} className="w-full">
          {qIndex < activeQuestions.length - 1 ? "Next Question →" : "Back to Quiz →"}
        </Button>
      )}
    </div>
  );
}
