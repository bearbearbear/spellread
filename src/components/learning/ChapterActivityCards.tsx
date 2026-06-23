
import { Link } from "react-router-dom";
import type { ChapterProgress } from "@/types";
import { getActiveQuizSections, countCompletedQuizSections } from "@/lib/quiz-progress";
import { getChapter } from "@/lib/content";

interface ChapterActivityCardsProps {
  book: number;
  chapter: number;
  progress: ChapterProgress;
}

export function ChapterActivityCards({ book, chapter, progress }: ChapterActivityCardsProps) {
  const content = getChapter(book, chapter);
  const quizSectionTotal = content ? getActiveQuizSections(content).length : 3;
  const quizSectionsDone = countCompletedQuizSections(
    content ? getActiveQuizSections(content) : [],
    progress.quizDraft?.completedSections ?? [],
  );
  const quizPassed = progress.status === "completed";
  const readingDone = progress.readingCompleted;
  const readingInProgress = progress.status === "reading" && !readingDone;

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link
        to={`/book/${book}/chapter/${chapter}/read`}
        className={`parchment-card block p-4 transition-colors hover:border-gold hover:bg-white/40 ${
          readingDone ? "border-success/40" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl" aria-hidden="true">📖</p>
            <p className="mt-2 font-semibold">Reading</p>
            <p className="text-sm text-ink-muted">Read this chapter in your book</p>
          </div>
          <div className="text-right">
            {readingDone ? (
              <>
                <p className="text-sm font-semibold text-success">Completed ✓</p>
                {progress.readingMinutes > 0 && (
                  <p className="text-xs text-ink-muted">{progress.readingMinutes} min</p>
                )}
              </>
            ) : readingInProgress ? (
              <p className="text-sm font-medium text-sky">In progress</p>
            ) : (
              <p className="text-sm text-ink-muted">Not started</p>
            )}
          </div>
        </div>
      </Link>

      <Link
        to={`/book/${book}/chapter/${chapter}/quiz`}
        className={`parchment-card block p-4 transition-colors hover:border-gold hover:bg-white/40 ${
          quizPassed ? "border-success/40" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-2xl" aria-hidden="true">❓</p>
            <p className="mt-2 font-semibold">Quiz</p>
            <p className="text-sm text-ink-muted">Comprehension, vocabulary & cloze</p>
          </div>
          <div className="text-right">
            {quizPassed ? (
              <>
                <p className="text-sm font-semibold text-success">Passed ✓</p>
                {progress.bestScore !== undefined && (
                  <p className="text-xs text-ink-muted">{Math.round(progress.bestScore * 100)}%</p>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-burgundy">
                  {quizSectionsDone}/{quizSectionTotal}
                </p>
                <p className="text-xs text-ink-muted">sections done</p>
              </>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
