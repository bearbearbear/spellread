export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Split example text into segments, highlighting the word as it appears in the quote. */
export function splitExampleByWord(
  example: string,
  word: string,
  formInText?: string,
): { text: string; highlight: boolean }[] {
  const highlightTarget = formInText?.trim() || word.trim();
  if (!highlightTarget) return [{ text: example, highlight: false }];

  const pattern = new RegExp(`(${escapeRegExp(highlightTarget)})`, "gi");
  const parts = example.split(pattern).filter((part) => part.length > 0);

  return parts.map((part) => ({
    text: part,
    highlight: part.toLowerCase() === highlightTarget.toLowerCase(),
  }));
}
