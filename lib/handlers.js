'use strict';

const { validateFormativkaPayload, validateAnalyzePayload } = require('./validate');
const { formativkaPrompt, analyzePrompt } = require('./prompts');
const { complete } = require('./anthropic');
const { t } = require('./i18n');

function buildFilename(...parts) {
  const stamp = new Date().toISOString().slice(0, 10);
  const safe = parts
    .filter(Boolean)
    .join(' — ')
    .replace(/[\\/:*?"<>|]/g, '')
    .trim()
    .slice(0, 120);
  return `${safe} (${stamp}).docx`;
}

async function handleFormativka(body) {
  const payload = validateFormativkaPayload(body);
  const prompt = formativkaPrompt(payload);
  const markdown = await complete(prompt, { maxTokens: 2500, lang: payload.lang, apiKey: payload.apiKey });
  const msg = t(payload.lang);
  return {
    markdown,
    filename: buildFilename(msg.filenameFormativka, payload.subject, msg.filenameGrade(payload.grade)),
  };
}

async function handleAnalyze(body) {
  const payload = validateAnalyzePayload(body);
  const prompt = analyzePrompt(payload);
  const markdown = await complete(prompt, { maxTokens: 3500, lang: payload.lang, apiKey: payload.apiKey });
  const msg = t(payload.lang);
  return {
    markdown,
    filename: buildFilename(msg.filenameAnalysis),
  };
}

module.exports = { handleFormativka, handleAnalyze };
