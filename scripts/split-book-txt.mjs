#!/usr/bin/env node
/**
 * Split a full-book TXT into per-chapter files.
 *
 * Usage:
 *   node scripts/split-book-txt.mjs --book 1
 *   node scripts/split-book-txt.mjs --book 1 --source "content/txt/Harry Potter and the Philosophers Stone.txt"
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

/** Book 1 chapter headings exactly as they appear in content/txt source files */
const BOOK1_CHAPTERS = [
  "THE BOY WHO LIVED",
  "THE VANISHING GLASS",
  "THE LETTERS FROM NO ONE",
  "THE KEEPER OF THE KEYS",
  "DIAGON ALLEY",
  "THE JOURNEY FROM PLATFORM NINE AND THREE QUARTERS",
  "THE SORTING HAT",
  "THE POTIONS MASTER",
  "THE MIDNIGHT DUEL",
  "HALLOWEEN",
  "QUIDDITCH",
  "THE MIRROR OF ERISED",
  "NICOLAS FLAMEL",
  "NORBERT THE NORWEGIAN RIDGEBACK",
  "THE FORBIDDEN FOREST",
  "THROUGH THE TRAPDOOR",
  "THE MAN WITH TWO FACES",
];

const BOOK_CHAPTERS = {
  1: BOOK1_CHAPTERS,
};

function parseArgs(argv) {
  const args = { book: 1, source: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--book" && argv[i + 1]) {
      args.book = parseInt(argv[++i], 10);
    } else if (argv[i] === "--source" && argv[i + 1]) {
      args.source = argv[++i];
    }
  }
  return args;
}

function defaultSource(book) {
  const txtDir = join(root, "content/txt");
  const files = readdirSync(txtDir).filter((f) => f.endsWith(".txt") && !f.startsWith("."));
  if (files.length === 0) {
    throw new Error(`No .txt files in ${txtDir}`);
  }
  if (book === 1) {
    const preferred = files.find((f) => /philosopher|sorcerer/i.test(f));
    if (preferred) return join(txtDir, preferred);
  }
  if (files.length === 1) return join(txtDir, files[0]);
  throw new Error(
    `Multiple TXT files in content/txt/. Pass --source explicitly.\nFound: ${files.join(", ")}`,
  );
}

function findChapterStarts(lines, titles) {
  const starts = [];
  for (let n = 0; n < titles.length; n++) {
    const num = n + 1;
    const title = titles[n];
    const pattern = new RegExp(`^${num}\\.\\s+${escapeRegExp(title)}\\s*$`);
    const altPattern =
      num === 6
        ? /^6\.\s+THE JOURNEY FROM PLATFORM NINE AND THREE[- ]QUARTERS\s*$/i
        : null;

    let lineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (pattern.test(line) || (altPattern && altPattern.test(line))) {
        lineIndex = i;
        break;
      }
    }
    if (lineIndex === -1) {
      throw new Error(`Chapter ${num} heading not found: "${num}. ${title}"`);
    }
    starts.push({ num, title, lineIndex });
  }
  return starts;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitBook(text, titles) {
  const lines = text.split(/\r?\n/);
  const starts = findChapterStarts(lines, titles);
  const chapters = [];

  for (let i = 0; i < starts.length; i++) {
    const startLine = starts[i].lineIndex;
    const endLine = i + 1 < starts.length ? starts[i + 1].lineIndex : lines.length;
    const body = lines.slice(startLine, endLine).join("\n").trimEnd() + "\n";
    chapters.push({ num: starts[i].num, title: starts[i].title, content: body });
  }

  return chapters;
}

function main() {
  const { book, source: sourceArg } = parseArgs(process.argv);
  const titles = BOOK_CHAPTERS[book];
  if (!titles) {
    throw new Error(`No chapter map for book ${book}. Add titles to BOOK_CHAPTERS in split-book-txt.mjs.`);
  }

  const sourcePath = sourceArg ?? defaultSource(book);
  const text = readFileSync(sourcePath, "utf8");
  const chapters = splitBook(text, titles);

  const outDir = join(root, "content/txt", `book${book}`);
  mkdirSync(outDir, { recursive: true });

  for (const ch of chapters) {
    const outPath = join(outDir, `chapter-${String(ch.num).padStart(2, "0")}.txt`);
    writeFileSync(outPath, ch.content, "utf8");
    console.log(`Wrote ${outPath} (${ch.content.length} chars)`);
  }

  console.log(`\nDone: ${chapters.length} chapters → ${outDir}`);
}

main();
