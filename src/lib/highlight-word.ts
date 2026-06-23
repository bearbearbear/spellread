export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split example text into segments, marking case-insensitive matches of `word`. */
export function splitExampleByWord(
  example: string,
  word: string,
): { text: string; highlight: boolean }[] {
  if (!word.trim()) return [{ text: example, highlight: false }];

  const pattern = new RegExp(`(${escapeRegExp(word)})`, "gi");
  const parts = example.split(pattern).filter((part) => part.length > 0);

  return parts.map((part) => ({
    text: part,
    highlight: part.toLowerCase() === word.toLowerCase(),
  }));
}
