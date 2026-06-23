
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getChapter } from "@/lib/content";
import { completePreview, getChapterProgress, resetSandboxChapter } from "@/lib/store";
import { isTestChapter } from "@/lib/content";
import { computeAdaptiveSettings, selectVocabularyForUser } from "@/lib/adaptive";
import { withShuffledOptions } from "@/lib/shuffle-options";
import { VocabFlashcard } from "@/components/learning/VocabFlashcard";
import { ChapterActivityCards } from "@/components/learning/ChapterActivityCards";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useChapterParams } from "@/hooks/useChapterParams";
import { useFlashcardDeck } from "@/hooks/useFlashcardDeck";

export function OverviewPage() {
  const { book, chapter } = useChapterParams();
  const navigate = useNavigate();
  const { state, setState } = useApp();
  const content = getChapter(book, chapter);
  const progress = getChapterProgress(state, book, chapter);

  const [miniIndex, setMiniIndex] = useState(0);
  const [miniDone, setMiniDone] = useState(false);

  const settings = useMemo(() => {
    if (!state.profile) return null;
    return computeAdaptiveSettings(state.profile, state.recentQuizScores);
  }, [state.profile, state.recentQuizScores]);

  const vocabList = useMemo(() => {
    if (!content || !settings) return [];
    return selectVocabularyForUser(content.vocabulary, settings);
  }, [content, settings]);

  const deck = useFlashcardDeck(vocabList);

  if (!content || !state.profile) {
    return <p>Chapter not found.</p>;
  }

  const learned = deck.known;

  const finishPreview = () => {
    if (progress.status !== "completed") {
      setState((prev) => completePreview(prev, book, chapter, Array.from(learned)));
    }
    navigate(`/book/${book}/chapter/${chapter}/read`);
  };

  const goToReading = () => {
    if (
      progress.status !== "completed" &&
      progress.status !== "reading" &&
      progress.status !== "quiz_pending" &&
      !progress.previewCompleted
    ) {
      setState((prev) => completePreview(prev, book, chapter, Array.from(learned)));
    }
    navigate(`/book/${book}/chapter/${chapter}/read`);
  };

  const overviewHeader = (
    <div>
      <div className="flex items-center justify-between gap-4">
        <Link to="/" className="text-sm text-ink-muted hover:underline">
          ← Back to map
        </Link>
        <button
          type="button"
          onClick={goToReading}
          className="text-sm text-ink-muted hover:underline"
        >
          Go to Reading →
        </button>
      </div>
      <h1 className="mt-2 text-2xl font-bold text-burgundy">Chapter Overview</h1>
      <p className="text-lg">
        Book {book} · Chapter {chapter}: <span className="italic">{content.title}</span>
      </p>
    </div>
  );

  if (deck.isComplete && !miniDone) {
    const q = withShuffledOptions(
      content.miniCheck[miniIndex],
      book * 1000 + chapter * 100 + miniIndex,
    );
    return (
      <div className="space-y-6">
        {overviewHeader}
        <ChapterActivityCards book={book} chapter={chapter} progress={progress} />
        <h2 className="text-2xl font-bold">Mini Check</h2>
        <div className="parchment-card p-6">
          <p className="mb-4 text-lg">{q.stem}</p>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  if (miniIndex < content.miniCheck.length - 1) {
                    setMiniIndex((i) => i + 1);
                  } else {
                    setMiniDone(true);
                  }
                }}
                className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-3 text-left hover:border-gold"
              >
                {opt.text}
              </button>
            ))}
          </div>
        </div>
        <p className="text-center text-sm text-ink-muted">
          No pressure — this does not block your reading!
        </p>
      </div>
    );
  }

  if (deck.isComplete && miniDone) {
    return (
      <div className="space-y-6 text-center">
        {overviewHeader}
        <ChapterActivityCards book={book} chapter={chapter} progress={progress} />
        <div className="text-5xl">✨</div>
        <h1 className="text-2xl font-bold">Vocabulary Ready!</h1>
        <p className="text-ink-muted">
          You learned {learned.size} words. Now read the chapter in your book.
        </p>
        <Button onClick={finishPreview} className="w-full">
          Start Reading →
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {overviewHeader}

      <ChapterActivityCards book={book} chapter={chapter} progress={progress} />

      {isTestChapter(chapter) && state.debugMode && (
        <section className="parchment-card border-2 border-dashed border-warning/60 p-4">
          <h2 className="font-semibold text-warning">🧪 Test Sandbox</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Use this chapter to test Reading and Quiz status cards repeatedly. Progress here does
            not unlock Chapters 1–17.
          </p>
          <Button
            variant="secondary"
            className="mt-3 w-full"
            onClick={() => {
              deck.reset();
              setMiniIndex(0);
              setMiniDone(false);
              setState((prev) => resetSandboxChapter(prev, book));
            }}
          >
            Reset Ch.0 progress
          </Button>
        </section>
      )}

      <ProgressBar value={learned.size} max={vocabList.length} label="Words learned" />

      <section className="parchment-card p-4">
        <h2 className="mb-2 font-semibold">📜 Background</h2>
        <p className="mb-3 text-ink-muted">{content.background.hook}</p>
        <h3 className="mb-1 text-sm font-semibold">Who&apos;s in this chapter?</h3>
        <div className="flex flex-wrap gap-2">
          {content.background.characters.map((c) => (
            <span key={c.name} className="rounded-full bg-forest/10 px-3 py-1 text-sm">
              {c.name}
            </span>
          ))}
        </div>
        <p className="mt-3 text-sm">
          <strong>Reading focus:</strong> {content.background.readingFocus}
        </p>
      </section>

      {deck.currentWord && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">📇 Vocabulary flashcards</h2>
          <VocabFlashcard
            item={deck.currentWord}
            index={learned.size + 1}
            total={vocabList.length}
            round={deck.round}
            knownCount={learned.size}
            flipped={deck.flipped}
            onFlip={() => deck.setFlipped((f) => !f)}
            onKnown={deck.markKnown}
            onLater={deck.markLater}
          />
        </section>
      )}

      {settings?.showExtraHints && (
        <p className="text-center text-sm text-sky">Extra hints are on — you&apos;ve got this!</p>
      )}
    </div>
  );
}
