
import { speak } from "@/lib/tts";
import type { VocabularyItem } from "@/types";
import { Button } from "@/components/ui/Button";

interface VocabCardProps {
  item: VocabularyItem;
  index: number;
  total: number;
  learned: boolean;
  onKnow: () => void;
  onPractice: () => void;
}

export function VocabCard({ item, index, total, learned, onKnow, onPractice }: VocabCardProps) {
  return (
    <div className="parchment-card p-6">
      <div className="mb-4 flex items-center justify-between text-sm text-ink-muted">
        <span>Word {index + 1} of {total}</span>
        {learned && <span className="text-success font-medium">✓ Learned</span>}
      </div>

      <div className="mb-4 flex items-start gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-forest/10 text-3xl"
          aria-hidden="true"
        >
          {item.tier === 3 ? "⚡" : item.tier === 2 ? "📚" : "🔤"}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-burgundy">{item.word}</h2>
            <button
              type="button"
              onClick={() => speak(item.word)}
              className="rounded-full bg-gold/20 p-2 text-lg hover:bg-gold/40"
              aria-label={`Listen to pronunciation of ${item.word}`}
            >
              🔊
            </button>
          </div>
          <p className="text-sm italic text-ink-muted">{item.partOfSpeech}</p>
          <p className="mt-2 text-lg">{item.definition}</p>
        </div>
      </div>

      <blockquote className="mb-4 rounded-lg border-l-4 border-gold bg-white/40 px-4 py-2 italic">
        &ldquo;{item.example}&rdquo;
        <footer className="mt-1 text-sm not-italic text-ink-muted">— {item.pageHint} in your book</footer>
      </blockquote>

      {item.grammarTip && (
        <p className="mb-4 text-sm text-ink-muted">💡 {item.grammarTip}</p>
      )}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onKnow} className="flex-1">
          I know this
        </Button>
        <Button onClick={onPractice} className="flex-1">
          Practice
        </Button>
      </div>
    </div>
  );
}
