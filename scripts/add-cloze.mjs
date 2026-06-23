#!/usr/bin/env node
/**
 * Adds quiz.cloze to all Book 1 chapter content packs.
 * Run: node scripts/add-cloze.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../content/book1");

const HANDCRAFTED = {
  1: {
    id: "cloze-ch01",
    title: "The Boy Who Lived",
    paragraphs: [
      "The Dursleys wanted to seem perfectly normal on Privet Drive. However, people sometimes (1) ___ about the Potters because strange things had happened. Mr. Dursley was a (2) ___ who knew nothing about magic.",
      "When the dark wizard attacked, he suddenly (3) ___ after failing to kill baby Harry. Wizards across Britain (4) ___ because the danger seemed to be over.",
      "Harry was the only person known to (5) ___ that terrible night. He grew up with a lightning-shaped (6) ___ on his forehead and slept in a (7) ___ under the stairs.",
    ],
    gaps: [
      {
        id: 1,
        answer: "whispered",
        acceptAlternatives: ["whisper"],
        gapType: "vocabulary",
        relatedWord: "whisper",
        explanation: "People spoke quietly about the Potters' strange history.",
        pageHint: "p. 2",
      },
      {
        id: 2,
        answer: "Muggle",
        acceptAlternatives: [],
        gapType: "vocabulary",
        relatedWord: "Muggle",
        explanation: "A Muggle is a person with no magical powers.",
        pageHint: "p. 3",
      },
      {
        id: 3,
        answer: "vanished",
        acceptAlternatives: [],
        gapType: "vocabulary",
        relatedWord: "vanished",
        explanation: "You-Know-Who disappeared after the attack failed.",
        pageHint: "p. 4",
      },
      {
        id: 4,
        answer: "rejoiced",
        acceptAlternatives: ["rejoice"],
        gapType: "vocabulary",
        relatedWord: "rejoice",
        explanation: "Wizards celebrated with joy and relief.",
        pageHint: "p. 4",
      },
      {
        id: 5,
        answer: "survive",
        acceptAlternatives: ["survived"],
        gapType: "vocabulary",
        relatedWord: "survive",
        explanation: "Harry stayed alive when the curse should have killed him.",
        pageHint: "p. 4",
      },
      {
        id: 6,
        answer: "scar",
        acceptAlternatives: [],
        gapType: "vocabulary",
        relatedWord: "scar",
        explanation: "The lightning-shaped mark was left by the failed curse.",
        pageHint: "p. 15",
      },
      {
        id: 7,
        answer: "cupboard",
        acceptAlternatives: [],
        gapType: "plot",
        relatedWord: "cupboard",
        explanation: "Harry's tiny bedroom shows how poorly the Dursleys treated him.",
        pageHint: "p. 14",
      },
    ],
    wordBank: [
      "whispered",
      "Muggle",
      "vanished",
      "rejoiced",
      "survived",
      "scar",
      "cupboard",
      "peculiar",
      "fortune",
      "grateful",
    ],
    guidedMode: true,
    openMode: true,
  },
  2: {
    id: "cloze-ch02",
    title: "The Vanishing Glass",
    paragraphs: [
      "On Dudley's birthday, the Dursley family visited the zoo. Harry felt (1) ___ watching his cousin get everything he wanted. Dudley threw a (2) ___ when he did not get enough food.",
      "At the reptile house, something (3) ___ happened. The glass in front of the snake cage suddenly (4) ___, and the snake slithered away.",
      "Uncle Vernon was furious. He (5) ___ at the memory of strange events and blamed Harry for the trouble near the snake (6) ___.",
    ],
    gaps: [
      { id: 1, answer: "miserable", gapType: "vocabulary", relatedWord: "miserable", explanation: "Harry felt very unhappy at the zoo.", pageHint: "p. 24" },
      { id: 2, answer: "tantrum", gapType: "vocabulary", relatedWord: "tantrum", explanation: "Dudley had an angry outburst when he was upset.", pageHint: "p. 22" },
      { id: 3, answer: "bizarre", gapType: "vocabulary", relatedWord: "bizarre", explanation: "The events at the zoo were very strange.", pageHint: "p. 28" },
      { id: 4, answer: "vanished", gapType: "vocabulary", relatedWord: "vanished", explanation: "The glass disappeared into thin air.", pageHint: "p. 28" },
      { id: 5, answer: "shuddered", acceptAlternatives: ["shudder"], gapType: "vocabulary", relatedWord: "shudder", explanation: "Vernon shook with fear or disgust.", pageHint: "p. 20" },
      { id: 6, answer: "cage", gapType: "plot", relatedWord: "cage", explanation: "The boa constrictor was kept in a glass cage.", pageHint: "p. 26" },
    ],
    wordBank: ["miserable", "tantrum", "bizarre", "vanished", "shuddered", "cage", "boast", "punishment", "apologize"],
    guidedMode: true,
    openMode: true,
  },
};

function gapAnswer(vocab) {
  const { word, partOfSpeech, example } = vocab;
  if (partOfSpeech === "verb" && example) {
    const match = example.match(/\b(\w+ed)\b/i);
    if (match) return match[1].toLowerCase();
  }
  if (partOfSpeech === "verb") {
    if (word.endsWith("e")) return `${word}d`;
    return `${word}ed`;
  }
  return word;
}

function buildGenericCloze(ch) {
  const words = ch.vocabulary.slice(0, 6);
  const distractors = ch.vocabulary.slice(6, 9).map((v) => v.word);
  const hook = ch.background?.hook ?? `Events in ${ch.title}.`;
  const hookSentence = hook.split(".")[0].trim();

  const answers = words.map(gapAnswer);
  const gaps = words.map((v, i) => ({
    id: i + 1,
    answer: answers[i],
    acceptAlternatives: answers[i] !== v.word ? [v.word] : [],
    gapType: i < 4 ? "vocabulary" : i === 4 ? "plot" : "vocabulary",
    relatedWord: v.word,
    explanation: `${v.word}: ${v.definition}`,
    pageHint: v.pageHint,
  }));

  const p1 = `${hookSentence}. In this chapter, an important word is (1) ___. The characters also face (2) ___ situations.`;
  const p2 = `As the story continues, readers notice (3) ___ details. Someone might (4) ___ when they feel strongly about events.`;
  const p3 = `By the end of "${ch.title}", the key idea involves (5) ___ and (6) ___.`;

  return {
    id: `cloze-ch${String(ch.chapter).padStart(2, "0")}`,
    title: ch.title,
    paragraphs: [p1, p2, p3],
    gaps,
    wordBank: [...answers, ...distractors],
    guidedMode: true,
    openMode: true,
  };
}

function buildCloze(ch) {
  return HANDCRAFTED[ch.chapter] ?? buildGenericCloze(ch);
}

for (let n = 1; n <= 17; n++) {
  const file = join(outDir, `chapter-${String(n).padStart(2, "0")}.json`);
  const ch = JSON.parse(readFileSync(file, "utf8"));
  ch.quiz.cloze = buildCloze(ch);
  writeFileSync(file, JSON.stringify(ch, null, 2) + "\n");
  console.log(`Added cloze to chapter ${n}: ${ch.quiz.cloze.gaps.length} gaps`);
}

console.log("Done.");
