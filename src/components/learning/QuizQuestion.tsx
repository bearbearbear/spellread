
import type { QuizQuestion as QuizQuestionType } from "@/types";
import { Button } from "@/components/ui/Button";

export type QuizSectionId = "comprehension" | "vocabulary";

export const QUIZ_SECTIONS: Record<
  QuizSectionId,
  { title: string; subtitle: string; icon: string; badgeClass: string }
> = {
  comprehension: {
    title: "Reading Comprehension",
    subtitle: "理解本章情节与人物",
    icon: "📖",
    badgeClass: "bg-sky/15 text-sky",
  },
  vocabulary: {
    title: "Vocabulary Training",
    subtitle: "巩固本章生词",
    icon: "✨",
    badgeClass: "bg-gold/20 text-burgundy",
  },
};

interface QuizQuestionProps {
  question: QuizQuestionType;
  index: number;
  total: number;
  section: QuizSectionId;
  selectedId: string | null;
  submitted: boolean;
  onSelect: (id: string) => void;
  onSubmit: () => void;
  showHints?: boolean;
}

export function QuizQuestionView({
  question,
  index,
  total,
  section,
  selectedId,
  submitted,
  onSelect,
  onSubmit,
  showHints,
}: QuizQuestionProps) {
  const meta = QUIZ_SECTIONS[section];
  const isCorrect = submitted && selectedId === question.correctId;

  return (
    <div className="parchment-card p-6">
      <div className="mb-4 flex items-center justify-between gap-2 text-sm">
        <span className={`rounded-full px-3 py-1 font-medium ${meta.badgeClass}`}>
          {meta.icon} {meta.title}
        </span>
        <span className="text-ink-muted">Question {index + 1} of {total}</span>
      </div>

      <h2 className="mb-6 text-xl font-semibold leading-relaxed">{question.stem}</h2>

      {showHints && question.pageHint && !submitted && (
        <p className="mb-4 rounded-lg bg-sky/10 px-3 py-2 text-sm text-sky">
          📖 Hint: Check {question.pageHint} in your book
        </p>
      )}

      <div className="mb-6 space-y-3" role="radiogroup" aria-label={question.stem}>
        {question.options.map((opt) => {
          let style = "border-2 border-parchment-dark bg-white/50 hover:border-gold";
          if (submitted) {
            if (opt.id === question.correctId) {
              style = "border-2 border-success bg-success/10";
            } else if (opt.id === selectedId) {
              style = "border-2 border-error bg-error/10";
            }
          } else if (selectedId === opt.id) {
            style = "border-2 border-burgundy bg-burgundy/5";
          }

          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selectedId === opt.id}
              disabled={submitted}
              onClick={() => onSelect(opt.id)}
              className={`w-full rounded-xl px-4 py-3 text-left text-lg transition-colors ${style}`}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div
          className={`mb-4 rounded-xl p-4 ${isCorrect ? "bg-success/10" : "bg-warning/10"}`}
        >
          <p className="font-semibold">{isCorrect ? "✓ Correct!" : "Not quite — keep learning!"}</p>
          <p className="mt-1 text-ink-muted">{question.explanation}</p>
        </div>
      )}

      {!submitted && (
        <Button onClick={onSubmit} disabled={!selectedId} className="w-full">
          Submit Answer
        </Button>
      )}
    </div>
  );
}

interface QuizSectionSummaryProps {
  section: QuizSectionId;
  correct: number;
  total: number;
  onContinue: () => void;
  continueLabel: string;
}

export function QuizSectionSummary({
  section,
  correct,
  total,
  onContinue,
  continueLabel,
}: QuizSectionSummaryProps) {
  const meta = QUIZ_SECTIONS[section];
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="space-y-6 text-center">
      <div className="text-5xl">{meta.icon}</div>
      <h1 className="text-2xl font-bold">{meta.title} — Section Complete</h1>
      <p className="text-3xl font-bold text-burgundy">
        {correct}/{total} ({pct}%)
      </p>
      <p className="text-ink-muted">{meta.subtitle}</p>
      <Button onClick={onContinue} className="w-full">
        {continueLabel}
      </Button>
    </div>
  );
}
