"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getDueVocab, scheduleReview, vocabKey } from "@/lib/srs";
import { getChapter } from "@/lib/content";
import { speak } from "@/lib/tts";
import { Button } from "@/components/ui/Button";

export default function ReviewPage() {
  const { state, setState } = useApp();
  const due = getDueVocab(state.vocabJournal, 10);
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);

  if (!state.profile) {
    return (
      <div className="text-center">
        <Link href="/onboarding" className="text-burgundy underline">Get started</Link>
      </div>
    );
  }

  if (due.length === 0 || done) {
    return (
      <div className="space-y-6 text-center">
        <div className="text-5xl">✨</div>
        <h1 className="text-2xl font-bold">
          {done ? "Review Complete!" : "All Caught Up!"}
        </h1>
        <p className="text-ink-muted">
          {done
            ? "Great job reviewing your words today."
            : "No words due for review. Complete more chapters to add words."}
        </p>
        <Link href="/">
          <Button>Back to Map</Button>
        </Link>
      </div>
    );
  }

  const entry = due[index];
  const ch = getChapter(entry.book, entry.chapter);
  const vocab = ch?.vocabulary.find((v) => v.word === entry.word);

  const handleAnswer = (correct: boolean) => {
    const key = vocabKey(entry.word, entry.book, entry.chapter);
    setState((prev) => ({
      ...prev,
      vocabJournal: {
        ...prev.vocabJournal,
        [key]: scheduleReview(prev.vocabJournal[key]!, correct),
      },
    }));

    if (index < due.length - 1) {
      setIndex((i) => i + 1);
      setShowAnswer(false);
    } else {
      setDone(true);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Today&apos;s Review</h1>
      <p className="text-ink-muted">Card {index + 1} of {due.length}</p>

      <div className="parchment-card p-8 text-center">
        <button
          type="button"
          onClick={() => speak(entry.word)}
          className="text-4xl font-bold text-burgundy"
        >
          {entry.word} 🔊
        </button>

        {showAnswer && vocab ? (
          <div className="mt-4">
            <p className="text-lg">{vocab.definition}</p>
            <p className="mt-2 italic text-ink-muted">&ldquo;{vocab.example}&rdquo;</p>
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => handleAnswer(false)} className="flex-1">
                Still learning
              </Button>
              <Button onClick={() => handleAnswer(true)} className="flex-1">
                Got it!
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setShowAnswer(true)} className="mt-6">
            Show Answer
          </Button>
        )}
      </div>
    </div>
  );
}
