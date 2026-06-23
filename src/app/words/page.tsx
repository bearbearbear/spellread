"use client";

import { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { getChapter } from "@/lib/content";
import { speak } from "@/lib/tts";
import { countByStatus } from "@/lib/srs";

export default function WordsPage() {
  const { state } = useApp();
  const [filter, setFilter] = useState<"all" | "new" | "learning" | "reviewing" | "mastered">("all");

  const entries = Object.values(state.vocabJournal).filter(
    (e) => filter === "all" || e.status === filter,
  );

  const counts = countByStatus(state.vocabJournal);

  if (!state.profile) {
    return (
      <div className="text-center">
        <p>Please complete onboarding first.</p>
        <Link href="/onboarding" className="text-burgundy underline">Get started</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-burgundy">Word Journal</h1>

      <div className="flex flex-wrap gap-2">
        {(["all", "new", "learning", "reviewing", "mastered"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-sm capitalize ${
              filter === s ? "bg-burgundy text-white" : "bg-parchment-dark"
            }`}
          >
            {s} {s !== "all" && `(${counts[s]})`}
          </button>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="parchment-card p-6 text-center text-ink-muted">
          <p>No words yet. Complete a chapter preview to start your journal!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const ch = getChapter(entry.book, entry.chapter);
            const vocab = ch?.vocabulary.find((v) => v.word === entry.word);
            return (
              <div key={`${entry.book}-${entry.chapter}-${entry.word}`} className="parchment-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => speak(entry.word)}
                      className="text-xl font-bold text-burgundy hover:underline"
                    >
                      {entry.word} 🔊
                    </button>
                    <p className="text-sm text-ink-muted">
                      Book {entry.book} Ch.{entry.chapter} · {entry.status}
                    </p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs capitalize ${
                    entry.status === "mastered" ? "bg-success/20 text-success" : "bg-gold/20"
                  }`}>
                    {entry.status}
                  </span>
                </div>
                {vocab && <p className="mt-2">{vocab.definition}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
