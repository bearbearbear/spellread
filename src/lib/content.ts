import type { BookMeta, ChapterContent } from "@/types";

import ch1 from "../../content/book1/chapter-01.json";
import ch2 from "../../content/book1/chapter-02.json";
import ch3 from "../../content/book1/chapter-03.json";
import ch4 from "../../content/book1/chapter-04.json";
import ch5 from "../../content/book1/chapter-05.json";
import ch6 from "../../content/book1/chapter-06.json";
import ch7 from "../../content/book1/chapter-07.json";
import ch8 from "../../content/book1/chapter-08.json";
import ch9 from "../../content/book1/chapter-09.json";
import ch10 from "../../content/book1/chapter-10.json";
import ch11 from "../../content/book1/chapter-11.json";
import ch12 from "../../content/book1/chapter-12.json";
import ch13 from "../../content/book1/chapter-13.json";
import ch14 from "../../content/book1/chapter-14.json";
import ch15 from "../../content/book1/chapter-15.json";
import ch16 from "../../content/book1/chapter-16.json";
import ch17 from "../../content/book1/chapter-17.json";

const BOOK1_CHAPTERS: ChapterContent[] = [
  ch1, ch2, ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, ch12, ch13, ch14, ch15, ch16, ch17,
] as ChapterContent[];

export const BOOKS: BookMeta[] = [
  {
    id: 1,
    title: "Harry Potter and the Philosopher's Stone",
    subtitle: "Book 1",
    lexile: 880,
    cefr: "B1",
    chapterCount: 17,
    chapters: BOOK1_CHAPTERS.map((c) => ({ number: c.chapter, title: c.title })),
  },
];

export function getBook(bookId: number): BookMeta | undefined {
  return BOOKS.find((b) => b.id === bookId);
}

export function getChapter(book: number, chapter: number): ChapterContent | undefined {
  if (book !== 1) return undefined;
  return BOOK1_CHAPTERS.find((c) => c.chapter === chapter);
}

export function getAllChapters(book: number): ChapterContent[] {
  if (book !== 1) return [];
  return BOOK1_CHAPTERS;
}

export function chapterKey(book: number, chapter: number): string {
  return `${book}-${chapter}`;
}
