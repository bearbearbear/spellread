import { useParams } from "react-router-dom";

export function useChapterParams() {
  const { bookId, chapterId } = useParams();
  return {
    book: parseInt(bookId ?? "1", 10),
    chapter: parseInt(chapterId ?? "1", 10),
  };
}
