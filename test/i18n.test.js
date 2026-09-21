'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { SUPPORTED_LANGS, normalizeLang, t } = require('../lib/i18n');

const ROOT = path.join(__dirname, '..');

describe('серверные сообщения (lib/i18n.js)', () => {
  test('normalizeLang: неизвестное → ru', () => {
    assert.strictEqual(normalizeLang('en'), 'en');
    assert.strictEqual(normalizeLang('kk'), 'kk');
    assert.strictEqual(normalizeLang('de'), 'ru');
    assert.strictEqual(normalizeLang(undefined), 'ru');
    assert.strictEqual(normalizeLang({}), 'ru');
  });

  test('во всех языках одинаковый набор ключей и одинаковые типы значений', () => {
    const base = t('ru');
    for (const lang of SUPPORTED_LANGS) {
      const msgs = t(lang);
      assert.deepStrictEqual(Object.keys(msgs).sort(), Object.keys(base).sort(), `ключи ${lang}`);
      for (const key of Object.keys(base)) {
        assert.strictEqual(typeof msgs[key], typeof base[key], `${lang}.${key}`);
        if (typeof msgs[key] === 'string') assert.ok(msgs[key].trim().length > 0, `${lang}.${key} пуст`);
      }
    }
  });

  test('функции-сообщения подставляют аргументы', () => {
    assert.match(t('ru').topicTooLong(800), /800/);
    assert.match(t('en').rowInvalid(3), /3/);
    assert.match(t('kk').filenameGrade(7), /7/);
  });
});

describe('клиентские словари (public/i18n.js)', () => {
  const source = fs.readFileSync(path.join(ROOT, 'public/i18n.js'), 'utf8');
  const hook = 'var current = detectDefault();';
  assert.ok(source.includes(hook), 'тест: не найдена точка подключения к словарю');

  const sandbox = {
    window: { TA: {}, localStorage: { getItem: () => null, setItem() {} } },
    navigator: { language: 'ru-RU' },
  };
  vm.createContext(sandbox);
  vm.runInContext(source.replace(hook, 'TA.__DICT = DICT; ' + hook), sandbox);
  const DICT = sandbox.window.TA.__DICT;

  test('есть ru, en, kk', () => {
    assert.deepStrictEqual(Object.keys(DICT).sort(), ['en', 'kk', 'ru']);
  });

  test('во всех языках одинаковые ключи', () => {
    const base = Object.keys(DICT.ru).sort();
    for (const lang of ['en', 'kk']) {
      assert.deepStrictEqual(Object.keys(DICT[lang]).sort(), base, `ключи ${lang}`);
    }
  });

  test('ключи, которые используют скрипты и разметка, существуют в словаре', () => {
    const used = new Set();
    const read = (f) => fs.readFileSync(path.join(ROOT, 'public', f), 'utf8');
    for (const f of ['app.js', 'tabs.js', 'api-client.js', 'docx-export.js', 'index.html']) {
      const s = read(f);
      for (const re of [
        /TA\.i18n\.t\('(\w+)'\)/g,
        /data-i18n(?:-ph)?="(\w+)"/g,
        /(?:heading|subheading|loadingLabelKey|idleLabelKey):\s*'(\w+)'/g,
      ]) {
        for (const m of s.matchAll(re)) used.add(m[1]);
      }
    }
    assert.ok(used.size > 20, 'слишком мало найденных ключей — регэксп устарел?');
    const missing = [...used].filter((k) => !(k in DICT.ru));
    assert.deepStrictEqual(missing, []);
  });
});

describe('index.html', () => {
  test('все id, к которым обращаются скрипты, есть в разметке', () => {
    const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
    const ids = new Set([...html.matchAll(/id="([\w-]+)"/g)].map((m) => m[1]));
    const needed = new Set();
    for (const f of ['app.js', 'tabs.js', 'ui-extras.js', 'table-upload.js']) {
      const s = fs.readFileSync(path.join(ROOT, 'public', f), 'utf8');
      for (const m of s.matchAll(/getElementById\('([\w-]+)'\)/g)) needed.add(m[1]);
      for (const m of s.matchAll(/bindCounter\('([\w-]+)', '([\w-]+)'/g)) {
        needed.add(m[1]);
        needed.add(m[2]);
      }
    }
    assert.deepStrictEqual([...needed].filter((id) => !ids.has(id)), []);
  });

  test('нет инлайновых скриптов и обработчиков — иначе их заблокирует CSP', () => {
    const html = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');
    assert.ok(!/\son\w+\s*=\s*"/.test(html), 'найден inline-обработчик on*=');
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'найден inline <script>');
  });
});
