
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import { getBook, getAllChapters } from "@/lib/content";
import { getChapterProgress, setDebugMode } from "@/lib/store";
import { readerLevelLabel } from "@/lib/adaptive";
import { countByStatus } from "@/lib/srs";
import { ChapterMap } from "@/components/learning/ChapterMap";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();
  const { state, setState, isReady } = useApp();
  const profile = state.profile;
  const book = getBook(1);

  useEffect(() => {
    if (isReady && !profile) {
      navigate("/onboarding", { replace: true });
    }
  }, [isReady, profile, navigate]);

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
          <Link to={continueHref}>
            <Button className="w-full">Continue →</Button>
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3">
        <Link to="/review" className="parchment-card p-4 text-center hover:shadow-md">
          <div className="text-2xl">✨</div>
          <div className="font-semibold">Review</div>
          <div className="text-sm text-ink-muted">{dueReview} words due</div>
        </Link>
        <Link to="/words" className="parchment-card p-4 text-center hover:shadow-md">
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
        <Link to="/parent" className="text-sm text-ink-muted underline">
          Parent Dashboard →
        </Link>
      </section>

      <section className="parchment-card border border-dashed border-ink-muted/30 p-4">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <div className="text-left">
            <p className="text-sm font-semibold text-ink-muted">Debug Mode</p>
            <p className="text-xs text-ink-muted">Unlock all chapters for testing</p>
          </div>
          <input
            type="checkbox"
            checked={state.debugMode}
            onChange={(e) => setState((prev) => setDebugMode(prev, e.target.checked))}
            className="h-5 w-5 accent-burgundy"
            aria-label="Toggle debug mode to unlock all chapters"
          />
        </label>
        {state.debugMode && (
          <p className="mt-2 text-xs text-warning">All chapters unlocked</p>
        )}
      </section>
    </div>
  );
}
