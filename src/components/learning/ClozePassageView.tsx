
import { useMemo, useState } from "react";
import type { ClozeGap, ClozePassage } from "@/types";
import { isGapCorrect, renderClozeParagraph } from "@/lib/cloze";
import { Button } from "@/components/ui/Button";
import { QUIZ_SECTIONS } from "@/components/learning/QuizQuestion";

interface ClozePassageViewProps {
  passage: ClozePassage;
  guided: boolean;
  answers: Record<number, string>;
  submitted: boolean;
  showHints?: boolean;
  onChangeAnswer: (gapId: number, value: string) => void;
  onSubmit: () => void;
}

function gapById(gaps: ClozeGap[], id: number): ClozeGap | undefined {
  return gaps.find((g) => g.id === id);
}

export function ClozePassageView({
  passage,
  guided,
  answers,
  submitted,
  showHints,
  onChangeAnswer,
  onSubmit,
}: ClozePassageViewProps) {
  const [activeGapId, setActiveGapId] = useState<number | null>(null);
  const meta = QUIZ_SECTIONS.cloze;

  const usedWords = useMemo(
    () => new Set(Object.values(answers).map((v) => v.toLowerCase())),
    [answers],
  );

  const allFilled = passage.gaps.every((g) => (answers[g.id] ?? "").trim().length > 0);
  const correctCount = submitted
    ? passage.gaps.filter((g) => isGapCorrect(g, answers[g.id])).length
    : 0;

  const handleWordBankClick = (word: string) => {
    if (submitted || !guided) return;
    const targetId = activeGapId ?? passage.gaps.find((g) => !answers[g.id])?.id;
    if (targetId === undefined) return;
    onChangeAnswer(targetId, word);
    setActiveGapId(null);
  };

  return (
    <div className="space-y-6">
      <div className="parchment-card p-6">
        <div className="mb-4 flex items-center justify-between gap-2 text-sm">
          <span className={`rounded-full px-3 py-1 font-medium ${meta.badgeClass}`}>
            {meta.icon} {meta.title}
          </span>
          <span className="text-ink-muted">
            {passage.gaps.length} blanks · {guided ? "Word Bank" : "Open Cloze"}
          </span>
        </div>

        <h2 className="mb-4 text-xl font-bold">{passage.title}</h2>

        {!submitted && (
          <p className="mb-4 rounded-lg bg-sky/10 px-3 py-2 text-sm text-sky">
            {guided
              ? "Read the passage first, then tap a blank and choose a word from the bank."
              : "Read the whole passage first. Write ONE word for each gap."}
          </p>
        )}

        <div className="space-y-4 text-lg leading-relaxed">
          {passage.paragraphs.map((paragraph, pIndex) => (
            <p key={pIndex}>
              {renderClozeParagraph(paragraph).map((part, i) => {
                if (part.gapId === null) {
                  return <span key={i}>{part.text}</span>;
                }

                const gap = gapById(passage.gaps, part.gapId)!;
                const value = answers[part.gapId] ?? "";
                const correct = submitted && isGapCorrect(gap, value);
                const wrong = submitted && value && !correct;
                const isActive = activeGapId === part.gapId;

                if (guided && !submitted) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveGapId(part.gapId)}
                      className={`mx-1 inline-flex min-w-[6rem] items-center justify-center rounded-lg border-b-2 px-2 py-0.5 font-medium transition-colors ${
                        isActive
                          ? "border-burgundy bg-burgundy/10 text-burgundy"
                          : value
                            ? "border-gold bg-gold/10"
                            : "border-parchment-dark bg-white/60 hover:border-gold"
                      }`}
                    >
                      {value || `(${part.gapId})`}
                    </button>
                  );
                }

                if (!guided && !submitted) {
                  return (
                    <span key={i} className="mx-1 inline-flex items-baseline gap-1">
                      <span className="text-sm text-ink-muted">({part.gapId})</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => onChangeAnswer(part.gapId!, e.target.value)}
                        className="w-28 rounded-lg border-2 border-parchment-dark bg-white/80 px-2 py-1 text-base focus:border-burgundy focus:outline-none"
                        aria-label={`Gap ${part.gapId}`}
                      />
                    </span>
                  );
                }

                return (
                  <span
                    key={i}
                    className={`mx-1 inline-flex min-w-[5rem] items-center justify-center rounded-lg border-b-2 px-2 py-0.5 font-semibold ${
                      correct
                        ? "border-success bg-success/10 text-success"
                        : wrong
                          ? "border-error bg-error/10 text-error line-through"
                          : "border-parchment-dark"
                    }`}
                  >
                    {value || "—"}
                    {wrong && (
                      <span className="ml-1 text-sm font-normal text-success no-underline">
                        ({gap.answer})
                      </span>
                    )}
                  </span>
                );
              })}
            </p>
          ))}
        </div>

        {guided && passage.wordBank && !submitted && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-ink-muted">Word Bank</p>
            <div className="flex flex-wrap gap-2">
              {passage.wordBank.map((word) => {
                const isUsed = usedWords.has(word.toLowerCase());
                return (
                  <button
                    key={word}
                    type="button"
                    disabled={isUsed}
                    onClick={() => handleWordBankClick(word)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isUsed
                        ? "cursor-not-allowed bg-parchment-dark/50 text-ink-muted line-through"
                        : "bg-burgundy/10 text-burgundy hover:bg-burgundy hover:text-white"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {submitted && (
          <div
            className={`mt-6 rounded-xl p-4 ${
              correctCount === passage.gaps.length ? "bg-success/10" : "bg-warning/10"
            }`}
          >
            <p className="font-semibold">
              {correctCount === passage.gaps.length
                ? "✓ Perfect passage!"
                : `${correctCount}/${passage.gaps.length} blanks correct`}
            </p>
            <div className="mt-3 space-y-2">
              {passage.gaps
                .filter((g) => !isGapCorrect(g, answers[g.id]))
                .map((g) => (
                  <div key={g.id} className="text-sm text-ink-muted">
                    <strong>Blank ({g.id}):</strong> {g.explanation}
                    {showHints && g.pageHint && (
                      <span className="ml-1 text-sky">· Check {g.pageHint}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}

        {!submitted && (
          <Button onClick={onSubmit} disabled={!allFilled} className="mt-6 w-full">
            Submit Passage
          </Button>
        )}
      </div>
    </div>
  );
}
