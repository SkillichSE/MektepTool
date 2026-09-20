'use strict';

const Anthropic = require('@anthropic-ai/sdk');
const { readEnv } = require('./config');
const { HttpError } = require('./errors');
const { t } = require('./i18n');

function getClient(apiKey, lang) {
  const env = readEnv();
  const key = apiKey || env.anthropicApiKey;
  if (!key) {
    throw new HttpError(401, t(lang).keyRequired, 'key_required');
  }
  return new Anthropic({ apiKey: key });
}

async function complete({ system, user }, { maxTokens = 3000, lang, apiKey } = {}) {
  const env = readEnv();
  const anthropic = getClient(apiKey, lang);
  const msg = t(lang);

  let response;
  try {
    response = await anthropic.messages.create({
      model: env.anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });
  } catch (err) {
    if (err && err.status === 401) {
      throw new HttpError(401, msg.keyInvalid, 'key_invalid');
    }
    if (err && err.status === 429) {
      throw new HttpError(429, msg.rateLimited, 'rate_limited');
    }
    if (err && err.status >= 400 && err.status < 500) {
      throw new HttpError(502, msg.upstreamBadRequest, 'upstream_error');
    }
    throw new HttpError(502, msg.upstreamError, 'upstream_error');
  }

  const text = (response.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!text) {
    throw new HttpError(502, msg.emptyResponse, 'empty_response');
  }
  return text;
}

module.exports = { complete };
