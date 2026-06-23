"use client";

import Link from "next/link";
import type { ChapterProgress, ChapterStatus } from "@/types";
import { getAllChapters } from "@/lib/content";

interface ChapterMapProps {
  book: number;
  getProgress: (chapter: number) => ChapterProgress;
}

const STATUS_STYLES: Record<ChapterStatus, string> = {
  locked: "bg-gray-300 text-gray-500 cursor-not-allowed",
  preview_available: "bg-gold/30 border-gold text-burgundy hover:bg-gold/50",
  reading: "bg-sky/20 border-sky text-sky hover:bg-sky/30",
  quiz_pending: "bg-warning/20 border-warning text-warning hover:bg-warning/30",
  completed: "bg-success/20 border-success text-success",
};

const STATUS_LABELS: Record<ChapterStatus, string> = {
  locked: "🔒",
  preview_available: "📚",
  reading: "📖",
  quiz_pending: "❓",
  completed: "⭐",
};

export function ChapterMap({ book, getProgress }: ChapterMapProps) {
  const chapters = getAllChapters(book);

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {chapters.map((ch) => {
        const progress = getProgress(ch.chapter);
        const status = progress.status;
        const isLocked = status === "locked";

        const href = isLocked
          ? "#"
          : status === "completed"
            ? `/book/${book}/chapter/${ch.chapter}/preview`
            : status === "quiz_pending"
              ? `/book/${book}/chapter/${ch.chapter}/quiz`
              : status === "reading"
                ? `/book/${book}/chapter/${ch.chapter}/read`
                : `/book/${book}/chapter/${ch.chapter}/preview`;

        const inner = (
          <div
            className={`flex flex-col items-center rounded-xl border-2 p-3 text-center transition-all ${STATUS_STYLES[status]}`}
          >
            <span className="text-lg" aria-hidden="true">{STATUS_LABELS[status]}</span>
            <span className="text-sm font-bold">Ch. {ch.chapter}</span>
            {progress.bestScore !== undefined && (
              <span className="text-xs">{Math.round(progress.bestScore * 100)}%</span>
            )}
          </div>
        );

        if (isLocked) {
          return (
            <div key={ch.chapter} title={ch.title} aria-label={`Chapter ${ch.chapter} locked`}>
              {inner}
            </div>
          );
        }

        return (
          <Link
            key={ch.chapter}
            href={href}
            title={ch.title}
            aria-label={`Chapter ${ch.chapter}: ${ch.title}`}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
