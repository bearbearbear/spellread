import { useCallback, useEffect, useMemo, useState } from "react";
import type { VocabularyItem } from "@/types";

export function useFlashcardDeck(words: VocabularyItem[]) {
  const wordKeys = useMemo(() => words.map((w) => w.word), [words]);

  const [known, setKnown] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [round, setRound] = useState(1);

  useEffect(() => {
    setKnown(new Set());
    setQueue(wordKeys);
    setFlipped(false);
    setRound(1);
  }, [wordKeys]);

  const currentWord = useMemo(() => {
    const key = queue[0];
    if (!key) return null;
    return words.find((w) => w.word === key) ?? null;
  }, [queue, words]);

  const isComplete = words.length > 0 && known.size === words.length;

  useEffect(() => {
    if (queue.length === 0 && words.length > 0 && known.size < words.length) {
      const remaining = words.filter((w) => !known.has(w.word)).map((w) => w.word);
      if (remaining.length > 0) {
        setQueue(remaining);
        setRound((r) => r + 1);
        setFlipped(false);
      }
    }
  }, [queue.length, known, words]);

  const markKnown = useCallback(() => {
    if (!currentWord) return;
    const word = currentWord.word;
    setKnown((prev) => new Set(prev).add(word));
    setQueue((q) => q.filter((w) => w !== word));
    setFlipped(false);
  }, [currentWord]);

  const markLater = useCallback(() => {
    if (!currentWord || queue.length === 0) return;
    setQueue((q) => [...q.slice(1), q[0]]);
    setFlipped(false);
  }, [currentWord, queue.length]);

  const reset = useCallback(() => {
    setKnown(new Set());
    setQueue(wordKeys);
    setFlipped(false);
    setRound(1);
  }, [wordKeys]);

  return {
    currentWord,
    known,
    queueLength: queue.length,
    flipped,
    setFlipped,
    markKnown,
    markLater,
    reset,
    isComplete,
    round,
    total: words.length,
  };
}
