"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getChapter } from "@/lib/content";
import { completeReading } from "@/lib/store";
import { Button } from "@/components/ui/Button";

export default function ReadPage({
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

  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [bookmarkPage, setBookmarkPage] = useState("");
  const [lookupWord, setLookupWord] = useState("");

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  if (!content) return <p>Chapter not found.</p>;

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const goal = state.profile?.dailyGoalMinutes ?? 15;

  const chapterVocab = content.vocabulary.find(
    (v) => v.word.toLowerCase() === lookupWord.toLowerCase(),
  );

  const handleFinish = () => {
    const readMinutes = Math.max(1, Math.round(seconds / 60));
    setState((prev) =>
      completeReading(
        prev,
        book,
        chapter,
        readMinutes,
        bookmarkPage ? parseInt(bookmarkPage, 10) : undefined,
      ),
    );
    router.push(`/book/${book}/chapter/${chapter}/quiz`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/book/${book}/chapter/${chapter}/preview`} className="text-sm text-ink-muted hover:underline">
          ← Back to preview
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Reading Time</h1>
        <p className="text-ink-muted">{content.title}</p>
      </div>

      <div className="parchment-card p-6 text-center">
        <p className="text-sm text-ink-muted">Read Chapter {chapter} in your own book</p>
        <div className="my-4 font-mono text-5xl font-bold text-burgundy">
          {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
        </div>
        <p className="text-sm text-ink-muted">
          ~{content.estimatedMinutes} min suggested · Goal: {goal} min/day
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Button variant="secondary" onClick={() => setRunning((r) => !r)}>
            {running ? "Pause" : "Resume"}
          </Button>
        </div>
      </div>

      <div className="parchment-card p-4">
        <h2 className="mb-2 font-semibold">🔍 Quick Word Lookup</h2>
        <input
          value={lookupWord}
          onChange={(e) => setLookupWord(e.target.value)}
          placeholder="Type a word..."
          className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-2"
        />
        {chapterVocab && (
          <div className="mt-2 rounded-lg bg-gold/10 p-3">
            <strong>{chapterVocab.word}</strong>: {chapterVocab.definition}
            <p className="text-sm italic">&ldquo;{chapterVocab.example}&rdquo;</p>
          </div>
        )}
      </div>

      <div className="parchment-card p-4">
        <label className="mb-2 block font-semibold">📑 Bookmark (page number)</label>
        <input
          type="number"
          value={bookmarkPage}
          onChange={(e) => setBookmarkPage(e.target.value)}
          placeholder="e.g. 25"
          className="w-full rounded-xl border-2 border-parchment-dark bg-white/50 px-4 py-2"
        />
      </div>

      <div className="parchment-card border-2 border-dashed border-gold/50 p-4 text-center text-sm text-ink-muted">
        <p>📖 Open your Harry Potter book and read Chapter {chapter}.</p>
        <p className="mt-1">SpellRead does not show the chapter text — bring your own book!</p>
      </div>

      <Button onClick={handleFinish} className="w-full">
        I&apos;m Done Reading → Take Quiz
      </Button>
    </div>
  );
}
