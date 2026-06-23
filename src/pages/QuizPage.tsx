
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getChapter } from "@/lib/content";
import { submitQuiz, addVocabFromQuiz } from "@/lib/store";
import { computeAdaptiveSettings, buildQuizSet } from "@/lib/adaptive";
import {
  QuizQuestionView,
  QuizSectionSummary,
  QUIZ_SECTIONS,
  type QuizSectionId,
} from "@/components/learning/QuizQuestion";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import type { QuizQuestion } from "@/types";
import { POINTS } from "@/types";

type QuizPhase = "overview" | "comprehension" | "comp-summary" | "vocabulary" | "results";

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

import { useChapterParams } from "@/hooks/useChapterParams";

export function QuizPage() {
  const { book, chapter } = useChapterParams();
  const navigate = useNavigate();
  const { state, setState } = useApp();
  const content = getChapter(book, chapter);

  const [attempt, setAttempt] = useState(0);
  const [phase, setPhase] = useState<QuizPhase>("overview");
  const [qIndex, setQIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    correct: number;
    comp: SectionScore;
    vocab: SectionScore;
  } | null>(null);

  const settings = useMemo(() => {
    if (!state.profile) return null;
    return computeAdaptiveSettings(state.profile, state.recentQuizScores);
  }, [state.profile, state.recentQuizScores]);

  const quizSet = useMemo(() => {
    if (!content) return { comprehension: [], vocabulary: [] };
    return buildQuizSet(content, chapter * 1000 + attempt);
  }, [content, chapter, attempt]);

  const compQuestions = quizSet.comprehension;
  const vocabQuestions = quizSet.vocabulary;

  const resetAttempt = () => {
    setPhase("overview");
    setQIndex(0);
    setSelectedId(null);
    setSubmitted(false);
    setAnswers({});
    setResult(null);
    setAttempt((a) => a + 1);
  };

  if (!content || !settings) return <p>Chapter not found.</p>;

  const passThreshold = settings.passThreshold;
  const activeSection: QuizSectionId | null =
    phase === "comprehension" ? "comprehension" : phase === "vocabulary" ? "vocabulary" : null;
  const activeQuestions =
    activeSection === "comprehension" ? compQuestions : activeSection === "vocabulary" ? vocabQuestions : [];
  const currentQ = activeQuestions[qIndex];

  const handleSubmit = () => {
    if (!selectedId || !currentQ) return;
    setSubmitted(true);
    setAnswers((prev) => ({ ...prev, [currentQ.id]: selectedId }));

    if (selectedId !== currentQ.correctId && currentQ.relatedWord) {
      setState((prev) =>
        addVocabFromQuiz(prev, currentQ.relatedWord!, book, chapter),
      );
    }
  };

  const finishQuiz = (finalAnswers: Record<string, string>) => {
    const comp = scoreSection(compQuestions, finalAnswers);
    const vocab = scoreSection(vocabQuestions, finalAnswers);
    const correct = comp.correct + vocab.correct;
    const total = comp.total + vocab.total;
    const score = total > 0 ? correct / total : 0;
    const passed = score >= passThreshold;

    const wrongIds: string[] = [];
    for (const q of [...compQuestions, ...vocabQuestions]) {
      if (finalAnswers[q.id] !== q.correctId) wrongIds.push(q.id);
    }

    setState((prev) =>
      submitQuiz(
        prev,
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
        },
        passThreshold,
      ),
    );

    setResult({ score, passed, correct, comp, vocab });
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

    if (phase === "comprehension") {
      setAnswers(finalAnswers);
      setPhase("comp-summary");
      setQIndex(0);
      setSelectedId(null);
      setSubmitted(false);
    } else if (phase === "vocabulary") {
      finishQuiz(finalAnswers);
    }
  };

  const compScore = scoreSection(compQuestions, answers);

  // --- Overview ---
  if (phase === "overview") {
    return (
      <div className="space-y-6">
        <div>
          <Link to={`/book/${book}/chapter/${chapter}/read`} className="text-sm text-ink-muted hover:underline">
            ← Back to reading
          </Link>
          <h1 className="mt-2 text-2xl font-bold">Chapter Quiz</h1>
          <p className="text-ink-muted">{content.title}</p>
        </div>

        <p className="text-ink-muted">
          The quiz has <strong>two sections</strong>. Complete them one at a time. You need{" "}
          {Math.round(passThreshold * 100)}% overall to pass.
        </p>

        <div className="space-y-3">
          {(["comprehension", "vocabulary"] as const).map((id, i) => {
            const meta = QUIZ_SECTIONS[id];
            const count = id === "comprehension" ? compQuestions.length : vocabQuestions.length;
            return (
              <div key={id} className="parchment-card flex items-center gap-4 p-4">
                <div className="text-3xl">{meta.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold">
                    Section {i + 1}: {meta.title}
                  </p>
                  <p className="text-sm text-ink-muted">{meta.subtitle} · {count} questions</p>
                </div>
              </div>
            );
          })}
        </div>

        <Button onClick={() => setPhase("comprehension")} className="w-full">
          Start Section 1: Reading Comprehension →
        </Button>
      </div>
    );
  }

  // --- Section 1 summary ---
  if (phase === "comp-summary") {
    return (
      <div className="space-y-6">
        <QuizSectionSummary
          section="comprehension"
          correct={compScore.correct}
          total={compScore.total}
          onContinue={() => setPhase("vocabulary")}
          continueLabel="Start Section 2: Vocabulary Training →"
        />
        <p className="text-center text-sm text-ink-muted">
          Take a short break if you need one — vocabulary section coming up!
        </p>
      </div>
    );
  }

  // --- Final results ---
  if (phase === "results" && result) {
    const compPct = result.comp.total > 0 ? Math.round((result.comp.correct / result.comp.total) * 100) : 0;
    const vocabPct = result.vocab.total > 0 ? Math.round((result.vocab.correct / result.vocab.total) * 100) : 0;

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-6xl">{result.passed ? "🎉" : "📚"}</div>
          <h1 className="text-3xl font-bold">
            {result.passed ? "Chapter Complete!" : "Keep Practicing!"}
          </h1>
          <p className="mt-2 text-xl">
            Overall: {Math.round(result.score * 100)}% ({result.correct}/{result.comp.total + result.vocab.total})
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

        <div className="grid grid-cols-2 gap-3">
          <div className="parchment-card p-4 text-center">
            <p className="text-sm text-ink-muted">📖 Comprehension</p>
            <p className="text-2xl font-bold text-burgundy">
              {result.comp.correct}/{result.comp.total}
            </p>
            <p className="text-sm">{compPct}%</p>
          </div>
          <div className="parchment-card p-4 text-center">
            <p className="text-sm text-ink-muted">✨ Vocabulary</p>
            <p className="text-2xl font-bold text-burgundy">
              {result.vocab.correct}/{result.vocab.total}
            </p>
            <p className="text-sm">{vocabPct}%</p>
          </div>
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

  // --- Active section (comprehension or vocabulary) ---
  if (!currentQ || !activeSection) return <p>No quiz questions.</p>;

  const sectionMeta = QUIZ_SECTIONS[activeSection];
  const sectionNumber = activeSection === "comprehension" ? 1 : 2;

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={() => (phase === "vocabulary" ? setPhase("comp-summary") : undefined)}
          className={`text-sm text-ink-muted ${phase === "vocabulary" ? "hover:underline" : "cursor-default"}`}
          disabled={phase !== "vocabulary"}
        >
          {phase === "vocabulary" ? "← Section 1 results" : `Section ${sectionNumber} of 2`}
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
          {qIndex < activeQuestions.length - 1
            ? "Next Question →"
            : phase === "comprehension"
              ? "Finish Section 1 →"
              : "See Results"}
        </Button>
      )}
    </div>
  );
}
