/**
 * Скачивает списки русских существительных из открытых источников на GitHub,
 * объединяет, фильтрует и сохраняет в nouns.json.
 *
 * Источники:
 *   1. Harrix/Russian-Nouns  (~51K лемм, им.п. ед.ч.)
 *   2. Badestrand/russian-dictionary nouns.csv (~27K, поле "bare")
 *
 * Запуск: node prepare_dict.mjs
 */

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

const OUT_PATH = path.resolve('nouns.json');
const CYRILLIC_RE = /^[а-яё]+$/;
const MIN_LEN = 2;

const SOURCES = {
  harrix: 'https://raw.githubusercontent.com/Harrix/Russian-Nouns/main/dist/russian_nouns.txt',
  badestrand: 'https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/nouns.csv',
};

function fetchText(url) {
  return new Promise((resolve, reject) => {
    const request = (targetUrl) => {
      https.get(targetUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${targetUrl}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
        res.on('error', reject);
      }).on('error', reject);
    };
    request(url);
  });
}

function parseHarrix(text) {
  return text.split('\n').map((l) => l.trim().toLowerCase()).filter(Boolean);
}

function parseBadestrand(csv) {
  const lines = csv.split('\n');
  const words = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols[0]) words.push(cols[0].trim().toLowerCase());
  }
  return words;
}

function isValidNoun(w) {
  return w.length >= MIN_LEN && CYRILLIC_RE.test(w);
}

async function main() {
  console.log('Скачиваю Harrix/Russian-Nouns...');
  const harrixText = await fetchText(SOURCES.harrix);
  const harrixWords = parseHarrix(harrixText);
  console.log(`  Harrix: ${harrixWords.length} слов`);

  console.log('Скачиваю Badestrand/russian-dictionary nouns...');
  const badeText = await fetchText(SOURCES.badestrand);
  const badeWords = parseBadestrand(badeText);
  console.log(`  Badestrand: ${badeWords.length} слов`);

  const all = new Set();
  for (const w of harrixWords) if (isValidNoun(w)) all.add(w);
  for (const w of badeWords) if (isValidNoun(w)) all.add(w);

  const sorted = [...all].sort();
  console.log(`Объединено уникальных существительных: ${sorted.length}`);

  fs.writeFileSync(OUT_PATH, JSON.stringify(sorted));
  const sizeMb = (fs.statSync(OUT_PATH).size / 1e6).toFixed(2);
  console.log(`Записано в ${OUT_PATH} (${sizeMb} МБ)`);
}

main().catch((err) => {
  console.error('Ошибка:', err);
  process.exit(1);
});
