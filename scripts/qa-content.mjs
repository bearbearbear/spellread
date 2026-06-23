#!/usr/bin/env node
/**
 * Validates all Book 1 content packs meet MVP requirements.
 * Run: node scripts/qa-content.mjs
 */
import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const contentDir = join(__dirname, "../content/book1");

const files = readdirSync(contentDir).filter((f) => f.endsWith(".json")).sort();
let errors = 0;

for (const file of files) {
  const data = JSON.parse(readFileSync(join(contentDir, file), "utf8"));
  const label = file;

  if (!data.title) { console.error(`${label}: missing title`); errors++; }
  if (!data.vocabulary || data.vocabulary.length < 8) {
    console.error(`${label}: need at least 8 vocabulary items, got ${data.vocabulary?.length}`);
    errors++;
  }
  if (!data.background?.hook) { console.error(`${label}: missing background.hook`); errors++; }
  if (!data.miniCheck || data.miniCheck.length < 3) {
    console.error(`${label}: need 3 miniCheck questions`);
    errors++;
  }
  const comp = data.quiz?.comprehension?.length ?? 0;
  const vocab = data.quiz?.vocabulary?.length ?? 0;
  if (comp < 5) { console.error(`${label}: need 5+ comprehension questions, got ${comp}`); errors++; }
  if (vocab < 4) { console.error(`${label}: need 4+ vocabulary questions, got ${vocab}`); errors++; }

  for (const q of [...(data.quiz?.comprehension ?? []), ...(data.quiz?.vocabulary ?? [])]) {
    if (!q.correctId || !q.options?.find((o) => o.id === q.correctId)) {
      console.error(`${label}: question ${q.id} has invalid correctId`);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log(`✓ All ${files.length} chapters passed QA`);
} else {
  console.error(`✗ ${errors} error(s) found`);
  process.exit(1);
}
