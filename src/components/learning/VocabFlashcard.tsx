
import { speak } from "@/lib/tts";
import { splitExampleByWord } from "@/lib/highlight-word";
import type { VocabularyItem } from "@/types";
import { Button } from "@/components/ui/Button";

interface VocabFlashcardProps {
  item: VocabularyItem;
  index: number;
  total: number;
  round: number;
  knownCount: number;
  flipped: boolean;
  onFlip: () => void;
  onKnown: () => void;
  onLater: () => void;
}

export function VocabFlashcard({
  item,
  index,
  total,
  round,
  knownCount,
  flipped,
  onFlip,
  onKnown,
  onLater,
}: VocabFlashcardProps) {
  const exampleParts = splitExampleByWord(item.example, item.word);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>
          Card {index} of {total} · Round {round}
        </span>
        <span>
          {knownCount}/{total} known
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onFlip();
          }
        }}
        className="parchment-card focus:ring-gold/50 min-h-[220px] w-full cursor-pointer p-8 text-center transition-all hover:border-gold focus:outline-none focus:ring-2"
        aria-label={flipped ? "Tap to show word" : "Tap to show meaning"}
      >
        {!flipped ? (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-3">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl bg-forest/10 text-3xl"
              aria-hidden="true"
            >
              {item.tier === 3 ? "⚡" : item.tier === 2 ? "📚" : "🔤"}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                speak(item.word);
              }}
              className="text-4xl font-bold text-burgundy"
              aria-label={`Listen to ${item.word}`}
            >
              {item.word} 🔊
            </button>
            <p className="text-sm italic text-ink-muted">{item.partOfSpeech}</p>
          </div>
        ) : (
          <div className="flex min-h-[160px] flex-col items-center justify-center gap-4 text-left">
            <p className="w-full text-center text-sm font-medium text-ink-muted">Meaning</p>
            <p className="w-full text-center text-2xl font-semibold text-burgundy">{item.definition}</p>
            <blockquote className="w-full rounded-lg border-l-4 border-gold bg-white/40 px-4 py-3 text-base italic">
              &ldquo;
              {exampleParts.map((part, i) =>
                part.highlight ? (
                  <mark key={i} className="rounded bg-gold/40 px-0.5 font-semibold not-italic text-burgundy">
                    {part.text}
                  </mark>
                ) : (
                  <span key={i}>{part.text}</span>
                ),
              )}
              &rdquo;
            </blockquote>
            <footer className="w-full text-center text-sm not-italic text-ink-muted">
              — {item.pageHint} in your book
            </footer>
            {item.grammarTip && (
              <p className="w-full text-center text-sm text-ink-muted">💡 {item.grammarTip}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onKnown} className="flex-1">
          I know it
        </Button>
        <Button onClick={onLater} className="flex-1">
          Show it later
        </Button>
      </div>
    </div>
  );
}
