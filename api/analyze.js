'use strict';

const { handleAnalyze } = require('../lib/handlers');
const { HttpError } = require('../lib/errors');
const { t } = require('../lib/i18n');

module.exports = async (req, res) => {
  const lang = req.body && req.body.lang;
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: t(lang).methodNotAllowed });
    return;
  }

  try {
    const result = await handleAnalyze(req.body);
    res.status(200).json(result);
  } catch (err) {
    sendError(res, err, lang);
  }
};

function sendError(res, err, lang) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, code: err.code });
    return;
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: t(lang).internalError });
}
