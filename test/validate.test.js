'use strict';

const { test, describe } = require('node:test');
const assert = require('node:assert');
const { validateFormativkaPayload, validateAnalyzePayload } = require('../lib/validate');
const { HttpError } = require('../lib/errors');
const { t } = require('../lib/i18n');

const validForm = () => ({ subject: ' Биология ', grade: '7', topic: ' Фотосинтез ', count: '5', notes: ' коротко ' });

function rejects(fn, status, message) {
  assert.throws(fn, (err) => {
    assert.ok(err instanceof HttpError, 'ожидалась HttpError');
    assert.strictEqual(err.status, status);
    if (message !== undefined) assert.strictEqual(err.message, message);
    return true;
  });
}

describe('validateFormativkaPayload', () => {
  test('нормализует корректные данные', () => {
    const out = validateFormativkaPayload(validForm());
    assert.deepStrictEqual(out, {
      lang: 'ru',
      subject: 'Биология',
      grade: '7',
      topic: 'Фотосинтез',
      count: 5,
      notes: 'коротко',
      apiKey: '',
    });
  });

  test('не-объект и null → 400 badJson', () => {
    rejects(() => validateFormativkaPayload(null), 400, t('ru').badJson);
    rejects(() => validateFormativkaPayload('строка'), 400, t('ru').badJson);
  });

  test('неизвестный язык откатывается на ru', () => {
    assert.strictEqual(validateFormativkaPayload({ ...validForm(), lang: 'fr' }).lang, 'ru');
  });

  test('сообщения об ошибках локализуются', () => {
    rejects(() => validateFormativkaPayload({ ...validForm(), lang: 'en', subject: '' }), 400, t('en').subjectRequired);
    rejects(() => validateFormativkaPayload({ ...validForm(), lang: 'kk', topic: '  ' }), 400, t('kk').topicRequired);
  });

  test('предмет: обязателен и не длиннее 200', () => {
    rejects(() => validateFormativkaPayload({ ...validForm(), subject: undefined }), 400, t('ru').subjectRequired);
    rejects(() => validateFormativkaPayload({ ...validForm(), subject: 'а'.repeat(201) }), 400, t('ru').subjectTooLong);
    assert.doesNotThrow(() => validateFormativkaPayload({ ...validForm(), subject: 'а'.repeat(200) }));
  });

  test('класс: только 1–11', () => {
    for (const grade of ['1', '11', ' 5 ']) {
      assert.doesNotThrow(() => validateFormativkaPayload({ ...validForm(), grade }));
    }
    for (const grade of ['0', '12', 'abc', '', undefined]) {
      rejects(() => validateFormativkaPayload({ ...validForm(), grade }), 400, t('ru').gradeRequired);
    }
  });

  test('тема: обязательна, максимум topicMax', () => {
    rejects(() => validateFormativkaPayload({ ...validForm(), topic: '' }), 400, t('ru').topicRequired);
    rejects(() => validateFormativkaPayload({ ...validForm(), topic: 'x'.repeat(801) }), 400, t('ru').topicTooLong(800));
    assert.doesNotThrow(() => validateFormativkaPayload({ ...validForm(), topic: 'x'.repeat(800) }));
  });

  test('количество заданий: целое от 1 до 20', () => {
    for (const count of [1, 20, '10']) {
      assert.strictEqual(validateFormativkaPayload({ ...validForm(), count }).count, Number(count));
    }
    for (const count of [0, 21, 1.5, 'abc', undefined, '']) {
      rejects(() => validateFormativkaPayload({ ...validForm(), count }), 400, t('ru').countRange(1, 20));
    }
  });

  test('комментарий: строка не длиннее notesMax, необязателен', () => {
    assert.strictEqual(validateFormativkaPayload({ ...validForm(), notes: undefined }).notes, '');
    assert.strictEqual(validateFormativkaPayload({ ...validForm(), notes: null }).notes, '');
    rejects(() => validateFormativkaPayload({ ...validForm(), notes: 123 }), 400, t('ru').notesType);
    rejects(() => validateFormativkaPayload({ ...validForm(), notes: 'x'.repeat(501) }), 400, t('ru').notesTooLong(500));
  });

  test('apiKey: пустой допустим, обрезается, слишком длинный/не строка — ошибка', () => {
    assert.strictEqual(validateFormativkaPayload({ ...validForm(), apiKey: '' }).apiKey, '');
    assert.strictEqual(validateFormativkaPayload({ ...validForm(), apiKey: '  sk-ant-123  ' }).apiKey, 'sk-ant-123');
    rejects(() => validateFormativkaPayload({ ...validForm(), apiKey: 'k'.repeat(301) }), 400, t('ru').keyInvalidFormat);
    rejects(() => validateFormativkaPayload({ ...validForm(), apiKey: 42 }), 400, t('ru').keyInvalidFormat);
  });
});

describe('validateAnalyzePayload', () => {
  const table = () => [['Ученик', 'З1', 'З2'], ['Иванов', 4, 5]];

  test('приводит ячейки к строкам и убирает пробелы', () => {
    const out = validateAnalyzePayload({ rows: [[' Ученик ', 'З1'], ['Иванов', 4], ['Петрова', null]], notes: ' 7Б ' });
    assert.deepStrictEqual(out.rows, [['Ученик', 'З1'], ['Иванов', '4'], ['Петрова', '']]);
    assert.strictEqual(out.notes, '7Б');
    assert.strictEqual(out.lang, 'ru');
  });

  test('минимум две строки (заголовок + данные)', () => {
    rejects(() => validateAnalyzePayload({ rows: [['a']] }), 400, t('ru').tableTooShort);
    rejects(() => validateAnalyzePayload({ rows: 'нет' }), 400, t('ru').tableTooShort);
    rejects(() => validateAnalyzePayload({}), 400, t('ru').tableTooShort);
  });

  test('лимит строк и столбцов', () => {
    const many = Array.from({ length: 201 }, () => ['a', 'b']);
    rejects(() => validateAnalyzePayload({ rows: many }), 400, t('ru').tableTooManyRows(200));
    const wide = [Array.from({ length: 31 }, () => 'x'), ['1']];
    rejects(() => validateAnalyzePayload({ rows: wide }), 400, t('ru').rowTooManyCols(1, 30));
  });

  test('строка обязана быть непустым массивом', () => {
    rejects(() => validateAnalyzePayload({ rows: [['a'], 'не массив'] }), 400, t('ru').rowInvalid(2));
    rejects(() => validateAnalyzePayload({ rows: [['a'], []] }), 400, t('ru').rowInvalid(2));
  });

  test('ячейка обрезается до 200 символов', () => {
    const out = validateAnalyzePayload({ rows: [['a'], ['я'.repeat(500)]] });
    assert.strictEqual(out.rows[1][0].length, 200);
  });

  test('комментарий и ключ проверяются так же, как в формативке', () => {
    rejects(() => validateAnalyzePayload({ rows: table(), notes: {} }), 400, t('ru').notesType);
    rejects(() => validateAnalyzePayload({ rows: table(), notes: 'x'.repeat(501) }), 400, t('ru').notesTooLong(500));
    rejects(() => validateAnalyzePayload({ rows: table(), apiKey: 'k'.repeat(301) }), 400, t('ru').keyInvalidFormat);
    assert.strictEqual(validateAnalyzePayload({ rows: table(), apiKey: ' sk ' }).apiKey, 'sk');
  });

  test('null → 400 badJson', () => {
    rejects(() => validateAnalyzePayload(null), 400, t('ru').badJson);
  });
});

test('класс числом (API-клиенты) принимается', () => {
  assert.strictEqual(validateFormativkaPayload({ ...validForm(), grade: 7 }).grade, '7');
});
