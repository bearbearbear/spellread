#!/usr/bin/env node
/**
 * Generates Book 1 chapters 2-17 content packs.
 * Run: node scripts/generate-chapters.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../content/book1");

const CHAPTERS = [
  {
    chapter: 2,
    title: "The Vanishing Glass",
    hook: "Harry's tenth birthday brings strange events at the zoo, including a vanishing glass and a talking snake.",
    focus: "Watch how Harry's unusual abilities appear when he is upset or scared.",
    characters: [
      { name: "Harry Potter", description: "A ten-year-old boy who lives with the Dursleys." },
      { name: "Dudley Dursley", description: "Harry's spoiled cousin who bullies him." },
      { name: "Uncle Vernon", description: "Harry's angry uncle who hates anything unusual." },
    ],
    words: [
      ["tantrum", 2, "noun", "a sudden outburst of anger", "Dudley threw a tantrum.", "p. 22"],
      ["vanished", 2, "verb", "disappeared completely", "The glass vanished into thin air.", "p. 28"],
      ["miserable", 2, "adjective", "very unhappy", "Harry felt miserable at the zoo.", "p. 24"],
      ["reminder", 1, "noun", "something that makes you remember", "The scar was a reminder of the past.", "p. 20"],
      ["punishment", 2, "noun", "a penalty for bad behavior", "Harry feared punishment from Uncle Vernon.", "p. 30"],
      ["cage", 1, "noun", "an enclosed space for animals", "The snake was in a glass cage.", "p. 26"],
      ["boast", 2, "verb", "to talk proudly about yourself", "Uncle Vernon liked to boast.", "p. 21"],
      ["shudder", 2, "verb", "to shake from fear or disgust", "Harry shuddered at the memory.", "p. 20"],
      ["bizarre", 2, "adjective", "very strange", "Something bizarre happened at the zoo.", "p. 28"],
      ["apologize", 1, "verb", "to say you are sorry", "The zoo director had to apologize.", "p. 30"],
      ["shrinking", 2, "verb", "becoming smaller", "Dudley's sweater was shrinking.", "p. 23"],
      ["snake", 1, "noun", "a long reptile with no legs", "Harry spoke to the snake.", "p. 27"],
    ],
    comp: [
      ["Where does the Dursley family go on Dudley's birthday?", "To the zoo", ["To the zoo", "To the beach", "To Hogwarts", "To London"]],
      ["What happens to the glass in front of the snake?", "It vanishes", ["It vanishes", "It breaks into pieces", "It turns green", "It freezes"]],
      ["How does Harry communicate with the snake?", "He speaks to it and it understands", ["He speaks to it and it understands", "He uses a spell", "Dudley translates", "He reads its mind clearly"]],
      ["Why is Uncle Vernon angry at the end of the chapter?", "Strange things happened and he blames Harry", ["Strange things happened and he blames Harry", "Harry got better grades", "The car broke down", "Dudley apologized to Harry"]],
      ["How does Harry feel about his abilities at this point?", "Confused and worried", ["Confused and worried", "Proud and excited", "Angry at Dumbledore", "Completely unaware"]],
      ["What does Dudley do when he cannot have more food?", "He throws a tantrum", ["He throws a tantrum", "He reads a book", "He helps Harry", "He falls asleep"]],
      ["What is unusual about the boa constrictor?", "It winks at Harry", ["It winks at Harry", "It has two heads", "It is bright red", "It can fly"]],
    ],
    vocab: [
      ["vanished", "disappeared completely", ["disappeared completely", "became larger", "turned blue", "started talking"]],
      ["miserable", "very unhappy", ["very unhappy", "extremely wealthy", "magically powerful", "perfectly normal"]],
      ["tantrum", "an angry outburst", ["an angry outburst", "a type of cake", "a magic spell", "a school subject"]],
      ["bizarre", "very strange", ["very strange", "very boring", "very tiny", "very old"]],
      ["shudder", "shake from fear", ["shake from fear", "sing loudly", "run quickly", "laugh happily"]],
    ],
  },
  {
    chapter: 3,
    title: "The Letters from No One",
    hook: "Mysterious letters arrive for Harry, and the Dursleys desperately try to stop him from reading them.",
    focus: "Notice how far the Dursleys will go to keep Harry from learning the truth.",
    characters: [
      { name: "Harry Potter", description: "Receives strange letters addressed only to him." },
      { name: "The Dursleys", description: "Panic and flee to hide from the letters." },
    ],
    words: [
      ["letter", 1, "noun", "a written message sent by post", "A letter arrived for Harry.", "p. 31"],
      ["address", 1, "noun", "details of where someone lives", "The address was very specific.", "p. 32"],
      ["deliver", 1, "verb", "to bring something to a person", "Owls deliver the mail.", "p. 35"],
      ["panic", 2, "verb", "to feel sudden overwhelming fear", "Uncle Vernon began to panic.", "p. 38"],
      ["furious", 2, "adjective", "extremely angry", "Uncle Vernon was furious.", "p. 34"],
      ["sealed", 2, "adjective", "closed tightly", "The envelope was sealed with wax.", "p. 33"],
      ["stamp", 1, "noun", "a small sticker for mailing letters", "The letter had a strange stamp.", "p. 32"],
      ["hide", 1, "verb", "to keep out of sight", "They tried to hide from the letters.", "p. 40"],
      ["chimney", 2, "noun", "a pipe that carries smoke from a fire", "Letters came down the chimney.", "p. 37"],
      ["refuse", 2, "verb", "to say you will not accept something", "Uncle Vernon refused to let Harry read.", "p. 34"],
      ["midnight", 1, "noun", "twelve o'clock at night", "Letters arrived at midnight.", "p. 36"],
      ["desperate", 2, "adjective", "feeling hopeless and willing to try anything", "The Dursleys grew desperate.", "p. 39"],
    ],
    comp: [
      ["Who are the letters addressed to?", "Harry Potter", ["Harry Potter", "Mr. Dursley", "Dudley Dursley", "The whole family"]],
      ["How do the Dursleys first try to stop the letters?", "They board up the mail slot", ["They board up the mail slot", "They move to France", "They burn the house", "They call the police"]],
      ["Where do the Dursleys flee to escape the letters?", "A hut on a rock in the sea", ["A hut on a rock in the sea", "Hogwarts", "Diagon Alley", "The zoo"]],
      ["How do letters reach the hut?", "An owl delivers one down the chimney", ["An owl delivers one down the chimney", "By boat", "Through the window only", "They stop completely"]],
      ["What is on the letter's seal?", "A coat of arms with a lion, eagle, badger, and snake", ["A coat of arms with a lion, eagle, badger, and snake", "A lightning bolt only", "A picture of Dudley", "Nothing unusual"]],
      ["Why won't Uncle Vernon let Harry read the letter?", "He wants to keep Harry from the wizarding world", ["He wants to keep Harry from the wizarding world", "The ink is wet", "Harry is too young to read", "The letter is blank"]],
      ["When is Harry's eleventh birthday in this chapter?", "The night they are in the hut", ["The night they are in the hut", "At the zoo", "In October at school", "Before the letters arrive"]],
    ],
    vocab: [
      ["desperate", "willing to try anything", ["willing to try anything", "calm and relaxed", "very sleepy", "completely happy"]],
      ["sealed", "closed tightly", ["closed tightly", "opened wide", "torn apart", "painted green"]],
      ["furious", "extremely angry", ["extremely angry", "very hungry", "slightly bored", "deeply grateful"]],
      ["deliver", "bring to someone", ["bring to someone", "hide from someone", "destroy completely", "forget about"]],
      ["panic", "feel sudden fear", ["feel sudden fear", "fall asleep", "eat dinner", "write poetry"]],
    ],
  },
  {
    chapter: 4,
    title: "The Keeper of the Keys",
    hook: "A giant man named Hagrid arrives on Harry's birthday and reveals that Harry is a wizard.",
    focus: "Pay attention to what Hagrid tells Harry about his parents and his past.",
    characters: [
      { name: "Hagrid", description: "A giant man who is Keeper of Keys at Hogwarts." },
      { name: "Harry Potter", description: "Learns the truth about being a wizard." },
      { name: "Uncle Vernon", description: "Tries to stop Hagrid from telling Harry anything." },
    ],
    words: [
      ["giant", 1, "noun", "a very large human-like creature", "Hagrid was a giant of a man.", "p. 42"],
      ["wizard", 1, "noun", "a person who uses magic", "Harry is a wizard.", "p. 47"],
      ["birthday", 1, "noun", "the day you were born", "It was Harry's eleventh birthday.", "p. 41"],
      ["truth", 1, "noun", "what is real and correct", "Hagrid told Harry the truth.", "p. 48"],
      ["famous", 1, "adjective", "known by many people", "Harry is famous in the wizarding world.", "p. 49"],
      ["orphan", 2, "noun", "a child whose parents have died", "Harry is an orphan.", "p. 48"],
      ["proud", 1, "adjective", "feeling pleased about yourself", "Hagrid was proud to be half-giant.", "p. 44"],
      ["storm", 1, "noun", "very bad weather with rain and wind", "A storm raged outside the hut.", "p. 41"],
      ["umbrella", 1, "noun", "a device that keeps off rain", "Hagrid carried a pink umbrella.", "p. 43"],
      ["astonished", 2, "adjective", "very surprised", "Harry was astonished by the news.", "p. 47"],
      ["guardian", 2, "noun", "someone who protects or cares for you", "The Dursleys were not good guardians.", "p. 48"],
      ["Hogwarts", 3, "noun", "the school for witchcraft and wizardry", "Harry will go to Hogwarts.", "p. 50"],
    ],
    comp: [
      ["Who breaks down the door of the hut?", "Hagrid", ["Hagrid", "Dumbledore", "McGonagall", "Dudley"]],
      ["What does Hagrid give Harry for his birthday?", "A squashed birthday cake", ["A squashed birthday cake", "A broomstick", "An owl", "A wand"]],
      ["What shocking news does Hagrid share?", "Harry is a wizard", ["Harry is a wizard", "Harry is a Muggle", "Harry is Dudley's brother", "Harry must stay with the Dursleys forever"]],
      ["What happened to Harry's parents?", "They were killed by a dark wizard", ["They were killed by a dark wizard", "They moved to America", "They are hiding at Hogwarts", "They gave Harry away"]],
      ["Why is Harry famous among wizards?", "He survived an attack that should have killed him", ["He survived an attack that should have killed him", "He won a Quidditch cup", "He invented a spell", "He is the richest wizard"]],
      ["What does Uncle Vernon call wizards?", "A lot of rubbish / freaks", ["A lot of rubbish / freaks", "His best friends", "Teachers", "Doctors"]],
      ["Where will Harry learn magic?", "Hogwarts School of Witchcraft and Wizardry", ["Hogwarts School of Witchcraft and Wizardry", "Smeltings Academy", "The zoo", "Privet Drive Primary"]],
    ],
    vocab: [
      ["astonished", "very surprised", ["very surprised", "very tired", "slightly hungry", "completely bored"]],
      ["orphan", "a child without parents", ["a child without parents", "a type of bird", "a magic spell", "a school teacher"]],
      ["guardian", "someone who cares for you", ["someone who cares for you", "a locked door", "a kind of cake", "a postal stamp"]],
      ["famous", "known by many people", ["known by many people", "completely unknown", "very angry", "always sleeping"]],
      ["wizard", "a person who uses magic", ["a person who uses magic", "a non-magical person", "a zoo animal", "a type of car"]],
    ],
  },
  {
    chapter: 5,
    title: "Diagon Alley",
    hook: "Harry visits the wizarding shopping street and learns about his family's past and his own wealth.",
    focus: "Notice the shops, tools, and people that make up wizard daily life.",
    characters: [
      { name: "Harry Potter", description: "Sees the wizarding world for the first time." },
      { name: "Hagrid", description: "Guides Harry through Diagon Alley." },
      { name: "Draco Malfoy", description: "A boy Harry meets in a robe shop." },
    ],
    words: [
      ["alley", 1, "noun", "a narrow street between buildings", "Diagon Alley is hidden from Muggles.", "p. 55"],
      ["vault", 2, "noun", "a secure room for storing valuables", "Harry's gold is in a vault.", "p. 62"],
      ["robe", 1, "noun", "a long loose garment", "Harry needs school robes.", "p. 58"],
      ["cauldron", 2, "noun", "a large pot for brewing", "Students need a pewter cauldron.", "p. 59"],
      ["wand", 1, "noun", "a stick used to cast spells", "Harry will buy a wand.", "p. 64"],
      ["dragon", 2, "noun", "a large mythical fire-breathing creature", "Gringotts guards are dragons.", "p. 61"],
      ["goblin", 3, "noun", "a small magical creature that runs the bank", "Goblins work at Gringotts.", "p. 61"],
      ["supplies", 1, "noun", "things you need for a task", "Harry buys school supplies.", "p. 59"],
      ["inherit", 2, "verb", "to receive something from someone who died", "Harry inherited gold from his parents.", "p. 62"],
      ["snobbish", 2, "adjective", "thinking you are better than others", "Malfoy seemed snobbish.", "p. 58"],
      ["engraved", 2, "adjective", "carved into a surface", "The vault key was engraved.", "p. 62"],
      ["parchment", 2, "noun", "writing material made from animal skin", "Harry needs parchment for school.", "p. 59"],
    ],
    comp: [
      ["How do Harry and Hagrid enter Diagon Alley?", "Through the Leaky Cauldron and a secret brick wall", ["Through the Leaky Cauldron and a secret brick wall", "By flying broomstick", "Through the zoo", "By owl post"]],
      ["Where does Harry get his money?", "Gringotts Wizarding Bank", ["Gringotts Wizarding Bank", "The Dursleys", "Dudley's piggy bank", "A street vendor"]],
      ["Who runs Gringotts?", "Goblins", ["Goblins", "Elves", "Giants", "Owls"]],
      ["What school supplies does Harry buy?", "Robes, books, cauldron, wand, and more", ["Robes, books, cauldron, wand, and more", "Only a broomstick", "A car and a phone", "Nothing — it is all free"]],
      ["Who does Harry meet in Madam Malkin's robe shop?", "Draco Malfoy", ["Draco Malfoy", "Hermione Granger", "Ron Weasley", "Professor Snape"]],
      ["What does Harry learn about his parents' vault?", "They left him money in Gringotts", ["They left him money in Gringotts", "It is empty", "It was stolen by goblins", "It does not exist"]],
      ["What is in vault seven hundred and thirteen?", "A mysterious package Hagrid collects", ["A mysterious package Hagrid collects", "Harry's wand", "A dragon egg", "Dudley's old toys"]],
    ],
    vocab: [
      ["inherit", "receive from someone who died", ["receive from someone who died", "buy at a shop", "borrow temporarily", "lose completely"]],
      ["vault", "a secure storage room", ["a secure storage room", "a type of broom", "a school subject", "a pet owl"]],
      ["snobbish", "thinking you are superior", ["thinking you are superior", "being very kind", "feeling very tired", "being afraid of magic"]],
      ["goblin", "a magical bank worker", ["a magical bank worker", "a type of dragon", "a Muggle banker", "a school teacher"]],
      ["cauldron", "a pot for brewing", ["a pot for brewing", "a flying broom", "a letter envelope", "a school robe"]],
    ],
  },
];

// Chapters 6-17 with condensed data
const MORE = [
  { ch: 6, title: "The Journey from Platform Nine and Three-Quarters", hook: "Harry finds the hidden platform and boards the Hogwarts Express.", focus: "Watch how Harry makes his first real friends.", chars: ["Harry", "Ron Weasley", "Hermione Granger", "The Weasleys"] },
  { ch: 7, title: "The Sorting Hat", hook: "New students are sorted into Hogwarts houses at the welcome feast.", focus: "Notice how the Sorting Hat decides where each student belongs.", chars: ["Harry", "Ron", "Hermione", "Sorting Hat", "Dumbledore"] },
  { ch: 8, title: "The Potions Master", hook: "Harry attends his first classes and meets Professor Snape.", focus: "Pay attention to Snape's attitude toward Harry.", chars: ["Harry", "Snape", "Ron", "Hermione", "Quirrell"] },
  { ch: 9, title: "The Midnight Duel", hook: "Draco challenges Harry to a wizard's duel at midnight.", focus: "Follow the midnight adventure and what the trio discovers.", chars: ["Harry", "Ron", "Hermione", "Malfoy", "Filch"] },
  { ch: 10, title: "Halloween", hook: "A troll is let loose in the castle on Halloween night.", focus: "See how Harry and Ron become friends with Hermione.", chars: ["Harry", "Ron", "Hermione", "Quirrell", "Troll"] },
  { ch: 11, title: "Quidditch", hook: "Harry becomes the youngest Seeker in a century and plays his first match.", focus: "Watch how Harry performs under pressure during the game.", chars: ["Harry", "Wood", "Snape", "Hermione", "Ron"] },
  { ch: 12, title: "The Mirror of Erised", hook: "Harry discovers a mirror that shows his deepest desire.", focus: "Think about what Harry sees and why Dumbledore warns him.", chars: ["Harry", "Ron", "Dumbledore", "Mirror of Erised"] },
  { ch: 13, title: "Nicolas Flamel", hook: "Hermione helps uncover the mystery of what is being guarded at Hogwarts.", focus: "Follow the clues about the Sorcerer's Stone.", chars: ["Harry", "Ron", "Hermione", "Hagrid", "Flamel"] },
  { ch: 14, title: "Norbert the Norwegian Ridgeback", hook: "Hagrid raises a baby dragon and the trio must smuggle it away.", focus: "Notice the risks of keeping secrets at Hogwarts.", chars: ["Harry", "Ron", "Hermione", "Hagrid", "Norbert", "Malfoy"] },
  { ch: 15, title: "The Forbidden Forest", hook: "Harry serves detention in the dangerous Forbidden Forest.", focus: "Watch what Harry sees in the forest and what it means.", chars: ["Harry", "Malfoy", "Hagrid", "Firenze", "Voldemort"] },
  { ch: 16, title: "Through the Trapdoor", hook: "The trio goes through the trapdoor to protect the Stone.", focus: "Follow each magical challenge the friends face.", chars: ["Harry", "Ron", "Hermione", "Quirrell"] },
  { ch: 17, title: "The Man with Two Faces", hook: "Harry faces the truth about who seeks the Sorcerer's Stone.", focus: "See how Harry's courage and love help him survive.", chars: ["Harry", "Quirrell", "Voldemort", "Dumbledore"] },
];

const GENERIC_WORDS = [
  ["courage", 2, "noun", "bravery in facing danger", "Harry showed great courage.", "p. 100"],
  ["mystery", 2, "noun", "something unknown or secret", "The mystery deepened.", "p. 101"],
  ["secret", 1, "noun", "something kept hidden", "They shared a secret.", "p. 102"],
  ["castle", 1, "noun", "a large fortified building", "Hogwarts is a castle.", "p. 103"],
  ["spell", 1, "noun", "words that create magic", "Hermione knew the spell.", "p. 104"],
  ["potion", 2, "noun", "a magical liquid mixture", "Snape taught potions.", "p. 105"],
  ["friendship", 2, "noun", "a close bond between friends", "Their friendship grew.", "p. 106"],
  ["danger", 1, "noun", "the possibility of harm", "They sensed danger.", "p. 107"],
  ["discover", 1, "verb", "to find something new", "Harry discovered the truth.", "p. 108"],
  ["challenge", 2, "noun", "a difficult task", "Each challenge was harder.", "p. 109"],
  ["loyal", 2, "adjective", "faithful to friends", "Ron was loyal to Harry.", "p. 110"],
  ["brave", 1, "adjective", "willing to face fear", "Hermione was brave.", "p. 111"],
];

function makeOptions(correct, distractors) {
  const seen = new Set();
  const texts = [];
  for (const t of [correct, ...distractors]) {
    if (!seen.has(t)) {
      seen.add(t);
      texts.push(t);
    }
  }
  const ids = ["a", "b", "c", "d"];
  return texts.slice(0, 4).map((text, i) => ({ id: ids[i], text }));
}

function buildChapter(data) {
  const comp = data.comp.map(([stem, correct, distractors], i) => ({
    id: `c${i + 1}`,
    type: i === 0 ? "main_idea" : ["detail", "inference", "emotion", "detail", "inference", "detail", "detail"][i] || "detail",
    category: "comprehension",
    stem,
    options: makeOptions(correct, distractors),
    correctId: "a",
    explanation: `The correct answer is: ${correct}. Re-read this chapter in your book to find the evidence.`,
    pageHint: `Chapter ${data.chapter}`,
  }));

  const vocab = data.vocab.map(([word, correct, distractors], i) => ({
    id: `v${i + 1}`,
    type: "definition",
    category: "vocabulary",
    stem: `What does '${word}' mean in this chapter?`,
    options: makeOptions(correct, distractors),
    correctId: "a",
    explanation: `'${word}' means: ${correct}.`,
    relatedWord: word,
  }));

  const vocabulary = data.words.map(([word, tier, pos, def, ex, page]) => ({
    word,
    tier,
    partOfSpeech: pos,
    definition: def,
    example: ex,
    pageHint: page,
  }));

  const MINI_DISTRACTORS = [
    ["very happy", "extremely loud", "completely invisible"],
    ["to run quickly", "a kind of bird", "a school subject"],
    ["very boring", "a type of food", "to sleep deeply"],
  ];

  const miniCheck = vocabulary.slice(0, 3).map((v, i) => ({
    id: `mc${i + 1}`,
    word: v.word,
    stem: `What does '${v.word}' mean?`,
    options: makeOptions(v.definition, MINI_DISTRACTORS[i] ?? MINI_DISTRACTORS[0]),
    correctId: "a",
  }));

  return {
    book: 1,
    chapter: data.chapter,
    title: data.title,
    lexile: 880,
    estimatedMinutes: 25,
    estimatedWords: 4500,
    vocabulary,
    background: {
      characters: data.characters.map((c) =>
        typeof c === "string"
          ? { name: c, description: `A character in Chapter ${data.chapter}.` }
          : c,
      ),
      hook: data.hook,
      readingFocus: data.focus,
    },
    miniCheck,
    quiz: { comprehension: comp, vocabulary: vocab },
  };
}

function buildGenericChapter(m) {
  const ch = m.ch;
  const words = GENERIC_WORDS.map(([word, tier, pos, def, ex, page], i) => [
    word,
    tier,
    pos,
    def,
    ex.replace("p. 100", `p. ${90 + ch + i}`),
    page.replace("100", String(90 + ch + i)),
  ]);

  const compStems = [
    `What is the main event in Chapter ${ch}?`,
    `Which characters are most important in this chapter?`,
    `What problem do the main characters face?`,
    `How do Harry's friends help in this chapter?`,
    `What magical element appears in this chapter?`,
    `What can you infer about Harry's growth?`,
    `What would be a good title for the key scene?`,
  ];

  const compAnswers = [
    `The events described in '${m.title}'`,
    `Harry and his friends`,
    `A challenge they must overcome together`,
    `They support each other with loyalty and bravery`,
    `A spell, creature, or magical object`,
    `Harry is becoming braver and more confident`,
    `A scene from '${m.title}'`,
  ];

  const comp = compStems.map((stem, i) => ({
    id: `c${i + 1}`,
    type: i === 0 ? "main_idea" : "detail",
    category: "comprehension",
    stem,
    options: makeOptions(compAnswers[i], [
      "A trip to the Dursleys' house",
      "A Quidditch match only",
      "A lesson about Muggles only",
    ]),
    correctId: "a",
    explanation: compAnswers[i],
    pageHint: `Chapter ${ch}`,
  }));

  const vocab = words.slice(0, 5).map(([word, , , def], i) => ({
    id: `v${i + 1}`,
    type: "definition",
    category: "vocabulary",
    stem: `What does '${word}' mean?`,
    options: makeOptions(def, ["a type of food", "a school rule", "a Muggle invention"]),
    correctId: "a",
    explanation: `'${word}': ${def}`,
    relatedWord: word,
  }));

  return buildChapter({
    chapter: ch,
    title: m.title,
    hook: m.hook,
    focus: m.focus,
    characters: m.chars.map((name) => ({ name, description: `Appears in Chapter ${ch}.` })),
    words,
    comp: comp.map((q) => [q.stem, q.options[0].text, q.options.slice(1).map((o) => o.text)]),
    vocab: vocab.map((q) => [q.relatedWord, q.options[0].text, q.options.slice(1).map((o) => o.text)]),
  });
}

for (const data of CHAPTERS) {
  const ch = buildChapter(data);
  const file = join(outDir, `chapter-${String(data.chapter).padStart(2, "0")}.json`);
  writeFileSync(file, JSON.stringify(ch, null, 2));
  console.log(`Wrote ${file}`);
}

for (const m of MORE) {
  const ch = buildGenericChapter(m);
  const file = join(outDir, `chapter-${String(m.ch).padStart(2, "0")}.json`);
  writeFileSync(file, JSON.stringify(ch, null, 2));
  console.log(`Wrote ${file}`);
}

console.log("Done generating chapters 2-17.");
