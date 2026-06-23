"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getChapter } from "@/lib/content";
import { completePreview } from "@/lib/store";
import { computeAdaptiveSettings, selectVocabularyForUser } from "@/lib/adaptive";
import { withShuffledOptions } from "@/lib/shuffle-options";
import { VocabCard } from "@/components/learning/VocabCard";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

export default function PreviewPage({
  params,
}: {
  params: Promise<{ bookId: string; chapterId: string }>;
}) {
  const { bookId, chapterId } = use(params);
  const book = parseInt(bookId, 10);
  const chapter = parseInt(chapterId, 10);
  const router = useRouter();
  const { state, setState } = useApp();
  const content = getChapter(book, chapter);

  const [wordIndex, setWordIndex] = useState(0);
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [showMiniCheck, setShowMiniCheck] = useState(false);
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

  if (!content || !state.profile) {
    return <p>Chapter not found.</p>;
  }

  const currentWord = vocabList[wordIndex];

  const handleKnow = () => {
    if (currentWord) {
      setLearned((prev) => new Set(prev).add(currentWord.word));
      if (wordIndex < vocabList.length - 1) setWordIndex((i) => i + 1);
      else setShowMiniCheck(true);
    }
  };

  const handlePractice = () => {
    if (wordIndex < vocabList.length - 1) setWordIndex((i) => i + 1);
    else setShowMiniCheck(true);
  };

  const finishPreview = () => {
    setState((prev) => completePreview(prev, book, chapter, Array.from(learned)));
    router.push(`/book/${book}/chapter/${chapter}/read`);
  };

  if (showMiniCheck && !miniDone) {
    const q = withShuffledOptions(
      content.miniCheck[miniIndex],
      book * 1000 + chapter * 100 + miniIndex,
    );
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Mini Check</h1>
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
        <p className="text-center text-sm text-ink-muted">No pressure — this does not block your reading!</p>
      </div>
    );
  }

  if (showMiniCheck && miniDone) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl">✨</div>
        <h1 className="text-2xl font-bold">Preview Complete!</h1>
        <p className="text-ink-muted">You learned {learned.size} words. Now read the chapter in your book.</p>
        <Button onClick={finishPreview} className="w-full">Start Reading →</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/" className="text-sm text-ink-muted hover:underline">← Back to map</Link>
        <h1 className="mt-2 text-2xl font-bold text-burgundy">
          Book {book} · Chapter {chapter}
        </h1>
        <p className="text-lg italic">{content.title}</p>
      </div>

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

      {currentWord && (
        <VocabCard
          item={currentWord}
          index={wordIndex}
          total={vocabList.length}
          learned={learned.has(currentWord.word)}
          onKnow={handleKnow}
          onPractice={handlePractice}
        />
      )}

      {learned.size === vocabList.length && !showMiniCheck && (
        <Button onClick={() => setShowMiniCheck(true)} className="w-full">
          Take Mini Check →
        </Button>
      )}

      {settings?.showExtraHints && (
        <p className="text-center text-sm text-sky">Extra hints are on — you&apos;ve got this!</p>
      )}
    </div>
  );
}
