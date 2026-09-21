'use strict';

const { test, describe, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const sdk = require('../test-utils/mock-sdk');
const { complete } = require('../lib/anthropic');
const { handleFormativka, handleAnalyze } = require('../lib/handlers');
const { formativkaPrompt, analyzePrompt } = require('../lib/prompts');

const form = { subject: 'Биология', grade: '7', topic: 'Фотосинтез', count: 5 };
const fail = (status) => async () => { throw Object.assign(new Error('x'), status ? { status } : {}); };

beforeEach(() => { sdk.reset(); delete process.env.ANTHROPIC_API_KEY; });

describe('prompts', () => {
  test('формативка содержит данные и язык ответа', () => {
    for (const lang of ['ru', 'en', 'kk']) {
      const p = formativkaPrompt({ ...form, notes: '', lang });
      for (const v of ['Биология', '7', 'Фотосинтез', '5']) assert.ok(p.user.includes(v), `${lang}: ${v}`);
      assert.ok(p.system.length > 100);
    }
    assert.ok(formativkaPrompt({ ...form, notes: 'ЗАМЕТКА', lang: 'ru' }).user.includes('ЗАМЕТКА'));
    assert.ok(!formativkaPrompt({ ...form, notes: '', lang: 'ru' }).user.includes('Дополнительные пожелания'));
  });
  test('анализ склеивает строки таблицы через " | "', () => {
    const p = analyzePrompt({ rows: [['А', 'Б'], ['1', '2']], notes: '', lang: 'en' });
    assert.ok(p.user.includes('А | Б\n1 | 2'));
  });
});

describe('complete (ошибки SDK)', () => {
  const call = (opts = {}) => complete({ system: 's', user: 'u' }, { apiKey: 'k', ...opts });
  const code = (p, status, c) => assert.rejects(p, (e) => e.status === status && e.code === c);

  test('нет ключа → 401 key_required', () => code(call({ apiKey: '' }), 401, 'key_required'));
  test('401 → key_invalid', () => { sdk.impl = fail(401); return code(call(), 401, 'key_invalid'); });
  test('429 → rate_limited', () => { sdk.impl = fail(429); return code(call(), 429, 'rate_limited'); });
  test('прочие 4xx и 5xx и сеть → 502', async () => {
    for (const s of [400, 404, 500, undefined]) { sdk.impl = fail(s); await code(call(), 502, 'upstream_error'); }
  });
  test('пустой ответ → 502 empty_response', () => {
    sdk.impl = async () => ({ content: [{ type: 'tool_use' }] });
    return code(call(), 502, 'empty_response');
  });
  test('склеивает только текстовые блоки', async () => {
    sdk.impl = async () => ({ content: [{ type: 'text', text: 'a' }, { type: 'x' }, { type: 'text', text: 'b' }] });
    assert.strictEqual(await call(), 'a\nb');
  });
  test('ключ из окружения и модель по умолчанию', async () => {
    process.env.ANTHROPIC_API_KEY = 'env-key';
    await complete({ system: 's', user: 'u' }, {});
    assert.strictEqual(sdk.constructed[0].apiKey, 'env-key');
    assert.strictEqual(sdk.calls[0].model, 'claude-sonnet-5');
  });
});

describe('handlers', () => {
  test('formativka: markdown, имя файла, параметры вызова', async () => {
    const out = await handleFormativka({ ...form, subject: 'Био/логия:', lang: 'en', apiKey: 'k' });
    assert.strictEqual(out.markdown, '# ok');
    assert.match(out.filename, /^Formative assessment — Биологи?я? — grade 7 \(\d{4}-\d{2}-\d{2}\)\.docx$|^Formative assessment — Био.*grade 7 \(\d{4}-\d{2}-\d{2}\)\.docx$/);
    assert.ok(!/[\\/:*?"<>|]/.test(out.filename.replace(/\.docx$/, '')));
    assert.strictEqual(sdk.calls[0].max_tokens, 2500);
  });
  test('analyze: имя файла и лимит токенов', async () => {
    const out = await handleAnalyze({ rows: [['a'], ['1']], apiKey: 'k' });
    assert.match(out.filename, /^Анализ оценок класса \(\d{4}-\d{2}-\d{2}\)\.docx$/);
    assert.strictEqual(sdk.calls[0].max_tokens, 3500);
  });
  test('невалидный ввод не доходит до SDK', async () => {
    await assert.rejects(handleFormativka({ ...form, count: 99, apiKey: 'k' }), (e) => e.status === 400);
    assert.strictEqual(sdk.calls.length, 0);
  });
});

describe('api/*.js (Vercel)', () => {
  const fakeRes = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; } });
  test('GET → 405 + Allow', async () => {
    const res = fakeRes();
    await require('../api/formativka')({ method: 'GET' }, res);
    assert.strictEqual(res.code, 405);
    assert.strictEqual(res.headers.Allow, 'POST');
  });
  test('POST: 400 при ошибке ввода, 200 при успехе', async () => {
    let res = fakeRes();
    await require('../api/analyze')({ method: 'POST', body: {} }, res);
    assert.strictEqual(res.code, 400);
    res = fakeRes();
    await require('../api/analyze')({ method: 'POST', body: { rows: [['a'], ['1']], apiKey: 'k' } }, res);
    assert.strictEqual(res.code, 200);
    assert.strictEqual(res.body.markdown, '# ok');
  });
  test('непредвиденная ошибка → 500 без утечки деталей', async () => {
    sdk.impl = async () => ({ content: 5 });
    const orig = console.error; console.error = () => {};
    const res = fakeRes();
    try { await require('../api/formativka')({ method: 'POST', body: { ...form, apiKey: 'k' } }, res); } finally { console.error = orig; }
    assert.strictEqual(res.code, 500);
    assert.deepStrictEqual(Object.keys(res.body), ['error']);
  });
});

describe('public/markdown.js', () => {
  const ctx = { window: { TA: {} } };
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/markdown.js'), 'utf8'), ctx);
  const md = ctx.window.TA.markdown;
  const plain = (x) => JSON.parse(JSON.stringify(x));

  test('блоки', () => {
    const blocks = plain(md.parseMarkdown('# H\n\nтекст\nещё\n\n- a\n- b\n\n1. x\n2) y\n\n---\n### h3'));
    assert.deepStrictEqual(blocks, [
      { type: 'h1', text: 'H' }, { type: 'p', text: 'текст ещё' },
      { type: 'ul', items: ['a', 'b'] }, { type: 'ol', items: ['x', 'y'] },
      { type: 'hr' }, { type: 'h3', text: 'h3' },
    ]);
  });
  test('«**жирный** текст» — абзац, а не список', () => {
    assert.strictEqual(md.parseMarkdown('**Итог** хорошо')[0].type, 'p');
  });
  test('HTML экранируется, жирный работает', () => {
    const html = md.renderHtml(md.parseMarkdown('<script>x</script> **b**'));
    assert.ok(!html.includes('<script>'));
    assert.ok(html.includes('<strong>b</strong>'));
  });
});
