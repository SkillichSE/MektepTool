'use strict';

const { limits } = require('./config');
const { HttpError } = require('./errors');
const { normalizeLang, t } = require('./i18n');

const ALLOWED_GRADES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function extractApiKey(body, msg) {
  const { apiKey } = body;
  if (apiKey == null || apiKey === '') return '';
  if (typeof apiKey !== 'string' || apiKey.trim().length > 300) {
    throw new HttpError(400, msg.keyInvalidFormat);
  }
  return apiKey.trim();
}

function validateFormativkaPayload(body) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, t().badJson);
  }
  const lang = normalizeLang(body.lang);
  const msg = t(lang);
  const { subject, topic, count, notes } = body;
  const grade = typeof body.grade === 'number' ? String(body.grade) : body.grade;

  if (!isNonEmptyString(subject)) {
    throw new HttpError(400, msg.subjectRequired);
  }
  if (subject.trim().length > 200) {
    throw new HttpError(400, msg.subjectTooLong);
  }
  if (!isNonEmptyString(grade) || !ALLOWED_GRADES.includes(String(grade).trim())) {
    throw new HttpError(400, msg.gradeRequired);
  }
  if (!isNonEmptyString(topic)) {
    throw new HttpError(400, msg.topicRequired);
  }
  if (topic.trim().length > limits.topicMax) {
    throw new HttpError(400, msg.topicTooLong(limits.topicMax));
  }

  const parsedCount = Number(count);
  if (!Number.isInteger(parsedCount) || parsedCount < limits.countMin || parsedCount > limits.countMax) {
    throw new HttpError(400, msg.countRange(limits.countMin, limits.countMax));
  }

  if (notes != null && typeof notes !== 'string') {
    throw new HttpError(400, msg.notesType);
  }
  if (notes && notes.length > limits.notesMax) {
    throw new HttpError(400, msg.notesTooLong(limits.notesMax));
  }

  return {
    lang,
    subject: subject.trim(),
    grade: String(grade).trim(),
    topic: topic.trim(),
    count: parsedCount,
    notes: (notes || '').trim(),
    apiKey: extractApiKey(body, msg),
  };
}

function validateAnalyzePayload(body) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, t().badJson);
  }
  const lang = normalizeLang(body.lang);
  const msg = t(lang);
  const { rows, notes } = body;

  if (!Array.isArray(rows) || rows.length < 2) {
    throw new HttpError(400, msg.tableTooShort);
  }
  if (rows.length > limits.tableRowsMax) {
    throw new HttpError(400, msg.tableTooManyRows(limits.tableRowsMax));
  }

  const cleanRows = rows.map((row, rowIndex) => {
    if (!Array.isArray(row) || row.length === 0) {
      throw new HttpError(400, msg.rowInvalid(rowIndex + 1));
    }
    if (row.length > limits.tableColsMax) {
      throw new HttpError(400, msg.rowTooManyCols(rowIndex + 1, limits.tableColsMax));
    }
    return row.map((cell) => String(cell ?? '').trim().slice(0, limits.cellMax));
  });

  if (notes != null && typeof notes !== 'string') {
    throw new HttpError(400, msg.notesType);
  }
  if (notes && notes.length > limits.notesMax) {
    throw new HttpError(400, msg.notesTooLong(limits.notesMax));
  }

  return { lang, rows: cleanRows, notes: (notes || '').trim(), apiKey: extractApiKey(body, msg) };
}

module.exports = { validateFormativkaPayload, validateAnalyzePayload };
