#!/usr/bin/env node
/**
 * Audit chapter vocabulary & quiz content against the Book 1 PDF.
 * Run: node scripts/audit-content-vs-pdf.mjs
 */
import { readFileSync, readdirSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pdfPath = join(root, "content/pdf/Harry Potter and the Sorcerers Stone.pdf");
const bookDir = join(root, "content/book1");

const CHAPTER_TITLES = [
  "THE BOY WHO LIVED",
  "THE VANISHING GLASS",
  "THE LETTERS FROM NO ONE",
  "THE KEEPER OF THE KEYS",
  "DIAGON ALLEY",
  "THE JOURNEY FROM PLATFORM NINE AND THREE-QUARTERS",
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

function extractPdfText() {
  const py = `
from pypdf import PdfReader
r = PdfReader(${JSON.stringify(pdfPath)})
print("".join((p.extract_text() or "") + "\\n" for p in r.pages))
`;
  const res = spawnSync("python3", ["-c", py], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  if (res.error) throw res.error;
  if (res.status !== 0) throw new Error(res.stderr || "PDF extract failed");
  return res.stdout;
}

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[^a-z0-9'"\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitChapters(fullText) {
  const chapters = {};
  for (let i = 0; i < CHAPTER_TITLES.length; i++) {
    const num = i + 1;
    const title = CHAPTER_TITLES[i];
    const markers = [
      `CHAPTER ${["ONE","TWO","THREE","FOUR","FIVE","SIX","SEVEN","EIGHT","NINE","TEN","ELEVEN","TWELVE","THIRTEEN","FOURTEEN","FIFTEEN","SIXTEEN","SEVENTEEN"][i]}`,
      title,
    ];
    const startIdx = fullText.indexOf(title);
    if (startIdx === -1) {
      chapters[num] = "";
      continue;
    }
    const nextTitle = CHAPTER_TITLES[i + 1];
    const endIdx = nextTitle ? fullText.indexOf(nextTitle, startIdx + title.length) : fullText.length;
    chapters[num] = fullText.slice(startIdx, endIdx === -1 ? undefined : endIdx);
  }
  return chapters;
}

function wordInText(word, text) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  const norm = normalize(text);
  const re = new RegExp(`\\b${w}\\w*\\b`, "i");
  return re.test(norm);
}

function exampleMatch(example, text) {
  const ex = normalize(example.replace(/[.?!]$/, ""));
  const body = normalize(text);
  // exact substring
  if (body.includes(ex)) return "exact";
  // check core phrase (drop leading/trailing short words)
  const words = ex.split(" ").filter((w) => w.length > 2);
  if (words.length < 3) return wordInText(words[0], text) ? "paraphrase" : "missing";
  const chunk = words.slice(0, Math.min(6, words.length)).join(" ");
  if (body.includes(chunk)) return "partial";
  // 50% word overlap in a sliding window
  const exSet = new Set(words);
  const textWords = body.split(" ");
  for (let i = 0; i < textWords.length - words.length + 1; i++) {
    const window = textWords.slice(i, i + words.length + 4);
    const overlap = window.filter((w) => exSet.has(w)).length;
    if (overlap >= Math.ceil(words.length * 0.6)) return "paraphrase";
  }
  return "missing";
}

function loadChapters() {
  return readdirSync(bookDir)
    .filter((f) => /^chapter-\d+\.json$/.test(f))
    .map((f) => JSON.parse(readFileSync(join(bookDir, f), "utf8")))
    .filter((c) => c.chapter > 0)
    .sort((a, b) => a.chapter - b.chapter);
}

function auditQuizQuestion(q, chText, chNum) {
  const issues = [];
  const correct = q.options?.find((o) => o.id === q.correctId)?.text ?? "";
  const stem = q.stem || "";

  // Flag stems that reference wrong chapter events (heuristic keywords)
  if (q.type === "detail" || q.type === "main_idea" || q.type === "inference") {
    // Check if correct answer key terms appear anywhere in book (weak signal)
    const keyTerms = normalize(correct).split(" ").filter((w) => w.length > 4);
    const foundInChapter = keyTerms.some((t) => normalize(chText).includes(t));
    if (keyTerms.length > 0 && !foundInChapter && correct.length > 3) {
      issues.push(`correct answer "${correct}" has few/no keyword matches in chapter text`);
    }
  }

  if (q.relatedWord && !wordInText(q.relatedWord, chText)) {
    issues.push(`related word "${q.relatedWord}" not found in chapter`);
  }

  return issues;
}

function main() {
  console.log("Extracting PDF...");
  const fullText = extractPdfText();
  const chapterTexts = splitChapters(fullText);

  const missingChapters = Object.entries(chapterTexts).filter(([, t]) => !t || t.length < 500);
  if (missingChapters.length) {
    console.warn("Warning: short/missing chapter splits:", missingChapters.map(([n]) => n).join(", "));
  }

  const contentChapters = loadChapters();
  const report = { summary: {}, chapters: [] };

  for (const ch of contentChapters) {
    const num = ch.chapter;
    const text = chapterTexts[num] || "";
    const entry = {
      chapter: num,
      title: ch.title,
      textLength: text.length,
      vocabulary: [],
      quiz: [],
      issues: [],
    };

    if (text.length < 500) {
      entry.issues.push("Could not extract sufficient chapter text from PDF");
    }

    for (const v of ch.vocabulary || []) {
      const wordFound =
        wordInText(v.word, text) ||
        (v.formInText ? wordInText(v.formInText, text) : false);
      const exStatus = exampleMatch(v.example, text);
      const item = {
        word: v.word,
        wordInChapter: wordFound,
        exampleStatus: exStatus,
        example: v.example,
        pageHint: v.pageHint,
      };
      entry.vocabulary.push(item);
      if (!wordFound) {
        entry.issues.push(`vocab "${v.word}": word not found in chapter text`);
      }
      if (exStatus === "missing") {
        entry.issues.push(`vocab "${v.word}": example not in book — "${v.example}"`);
      } else if (exStatus === "paraphrase") {
        entry.issues.push(`vocab "${v.word}": example is paraphrased, not from book — "${v.example}"`);
      }
    }

    const allQuiz = [
      ...(ch.quiz?.comprehension || []),
      ...(ch.quiz?.vocabulary || []),
    ];
    for (const q of allQuiz) {
      const qIssues = auditQuizQuestion(q, text, num);
      if (qIssues.length) {
        entry.quiz.push({ id: q.id, stem: q.stem, issues: qIssues });
        entry.issues.push(...qIssues.map((i) => `quiz [${q.id}]: ${i}`));
      }
    }

  // cloze gaps
    const cloze = ch.quiz?.cloze;
    if (cloze?.gaps) {
      for (const g of cloze.gaps) {
        if (g.answer && !wordInText(g.answer, text)) {
          entry.issues.push(`cloze gap ${g.id} answer "${g.answer}" not found in chapter`);
        }
      }
    }

    report.chapters.push(entry);
    report.summary[num] = {
      vocabTotal: entry.vocabulary.length,
      vocabWordMissing: entry.vocabulary.filter((v) => !v.wordInChapter).length,
      vocabExampleMissing: entry.vocabulary.filter((v) => v.exampleStatus === "missing").length,
      vocabExampleParaphrase: entry.vocabulary.filter((v) => v.exampleStatus === "paraphrase").length,
      issueCount: entry.issues.length,
    };
  }

  console.log("\n=== AUDIT SUMMARY ===\n");
  let totalIssues = 0;
  for (const e of report.chapters) {
    const s = report.summary[e.chapter];
    totalIssues += s.issueCount;
    console.log(
      `Ch.${String(e.chapter).padStart(2)} ${e.title}: ` +
        `${s.vocabWordMissing} word-miss, ${s.vocabExampleMissing} ex-miss, ${s.vocabExampleParaphrase} ex-paraphrase, ` +
        `${s.issueCount} total issues`,
    );
  }
  console.log(`\nTotal issues: ${totalIssues}\n`);

  console.log("=== DETAILED ISSUES ===\n");
  for (const e of report.chapters) {
    if (!e.issues.length) continue;
    console.log(`--- Chapter ${e.chapter}: ${e.title} ---`);
    for (const issue of e.issues) console.log(`  • ${issue}`);
    console.log();
  }

  const outPath = join(root, "docs/CONTENT_AUDIT_VS_PDF.md");
  writeReport(outPath, report, totalIssues);
}

function writeReport(outPath, report, totalIssues) {
  const lines = [
    "# Content Audit vs Book 1 PDF",
    "",
    `Generated from \`content/pdf/Harry Potter and the Sorcerers Stone.pdf\``,
    "",
    `**Total issues found:** ${totalIssues}`,
    "",
    "## Summary",
    "",
    "| Ch | Title | Word missing | Example missing | Example paraphrase | Total |",
    "|----|-------|--------------|-----------------|-------------------|-------|",
  ];
  for (const e of report.chapters) {
    const s = report.summary[e.chapter];
    lines.push(
      `| ${e.chapter} | ${e.title} | ${s.vocabWordMissing} | ${s.vocabExampleMissing} | ${s.vocabExampleParaphrase} | ${s.issueCount} |`,
    );
  }
  lines.push("", "## Details by chapter", "");
  for (const e of report.chapters) {
    lines.push(`### Chapter ${e.chapter}: ${e.title}`, "");
    if (!e.issues.length) {
      lines.push("No issues detected.", "");
      continue;
    }
    for (const issue of e.issues) lines.push(`- ${issue}`);
    lines.push("");
    lines.push("<details><summary>Vocabulary check table</summary>", "");
    lines.push("| Word | In chapter | Example status | Example |");
    lines.push("|------|------------|----------------|---------|");
    for (const v of e.vocabulary) {
      lines.push(`| ${v.word} | ${v.wordInChapter ? "✓" : "✗"} | ${v.exampleStatus} | ${v.example} |`);
    }
    lines.push("", "</details>", "");
  }
  writeFileSync(outPath, lines.join("\n"));
  console.log(`Full report written to ${outPath}`);
}

main();
