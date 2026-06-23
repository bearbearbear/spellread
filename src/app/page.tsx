"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { getBook, getAllChapters } from "@/lib/content";
import { getChapterProgress } from "@/lib/store";
import { readerLevelLabel } from "@/lib/adaptive";
import { countByStatus } from "@/lib/srs";
import { ChapterMap } from "@/components/learning/ChapterMap";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();
  const { state, isReady } = useApp();
  const profile = state.profile;
  const book = getBook(1);

  useEffect(() => {
    if (isReady && !profile) {
      router.replace("/onboarding");
    }
  }, [isReady, profile, router]);

  if (!isReady || !profile || !book) {
    return <div className="text-center text-ink-muted">Loading your map...</div>;
  }

  const vocabCounts = countByStatus(state.vocabJournal);
  const dueReview = Object.values(state.vocabJournal).filter(
    (e) => e.status !== "mastered" && e.nextReview <= new Date().toISOString().split("T")[0],
  ).length;

  const chapters = getAllChapters(1);
  const nextChapter = chapters.find((ch) => {
    const p = getChapterProgress(state, 1, ch.chapter);
    return p.status !== "locked" && p.status !== "completed";
  });

  const continueHref = nextChapter
    ? nextChapter.chapter && getChapterProgress(state, 1, nextChapter.chapter).status === "quiz_pending"
      ? `/book/1/chapter/${nextChapter.chapter}/quiz`
      : getChapterProgress(state, 1, nextChapter.chapter).status === "reading"
        ? `/book/1/chapter/${nextChapter.chapter}/read`
        : `/book/1/chapter/${nextChapter.chapter}/preview`
    : "/book/1/chapter/1/preview";

  return (
    <div className="space-y-6">
      <header className="parchment-card p-6">
        <p className="text-sm text-ink-muted">Welcome back,</p>
        <h1 className="text-3xl font-bold text-burgundy">
          {profile.avatar} {profile.nickname}
        </h1>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-gold/20 px-3 py-1">
            {readerLevelLabel(profile.readerLevel)}
          </span>
          <span className="rounded-full bg-burgundy/10 px-3 py-1">
            🔥 {profile.streakDays} day streak
          </span>
          <span className="rounded-full bg-forest/10 px-3 py-1">
            ⭐ {profile.housePoints} House Points
          </span>
        </div>
      </header>

      {nextChapter && (
        <section className="parchment-card p-6">
          <h2 className="mb-2 text-xl font-semibold">Continue Reading</h2>
          <p className="mb-4 text-ink-muted">
            Chapter {nextChapter.chapter}: {nextChapter.title}
          </p>
          <Link href={continueHref}>
            <Button className="w-full">Continue →</Button>
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <Link href="/review" className="parchment-card p-4 text-center hover:shadow-md">
          <div className="text-2xl">✨</div>
          <div className="font-semibold">Review</div>
          <div className="text-sm text-ink-muted">{dueReview} words due</div>
        </Link>
        <Link href="/words" className="parchment-card p-4 text-center hover:shadow-md">
          <div className="text-2xl">📖</div>
          <div className="font-semibold">Word Journal</div>
          <div className="text-sm text-ink-muted">{vocabCounts.mastered} mastered</div>
        </Link>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">{book.title}</h2>
        <p className="mb-4 text-sm text-ink-muted">
          Lexile {book.lexile}L · {book.cefr} · {book.chapterCount} chapters
        </p>
        <ChapterMap
          book={1}
          getProgress={(ch) => getChapterProgress(state, 1, ch)}
        />
      </section>

      <section className="text-center">
        <Link href="/parent" className="text-sm text-ink-muted underline">
          Parent Dashboard →
        </Link>
      </section>
    </div>
  );
}
