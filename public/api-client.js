'use strict';

window.TA = window.TA || {};

(function (TA) {
  class ApiError extends Error {
    constructor(message, code) {
      super(message);
      this.name = 'ApiError';
      this.code = code;
    }
  }

  async function postJson(path, body) {
    const apiKey = TA.settings.getApiKey();
    if (!apiKey) {
      throw new ApiError(TA.i18n.t('errKeyMissing'), 'key_required');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), window.APP_CONFIG.requestTimeoutMs);
    const payload = Object.assign({}, body, { lang: TA.i18n.getLang(), apiKey });

    let response;
    try {
      response = await fetch(window.APP_CONFIG.apiBaseUrl + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new ApiError(TA.i18n.t('errTimeout'), 'timeout');
      }
      throw new ApiError(TA.i18n.t('errNetwork'), 'network');
    } finally {
      clearTimeout(timeout);
    }

    let data = null;
    try {
      data = await response.json();
    } catch (err) {}

    if (!response.ok) {
      if (response.status === 401) {
        throw new ApiError((data && data.error) || TA.i18n.t('errKeyMissing'), (data && data.code) || 'key_invalid');
      }
      if (response.status === 429) {
        throw new ApiError((data && data.error) || TA.i18n.t('errRateLimited'), 'rate_limited');
      }
      throw new ApiError((data && data.error) || TA.i18n.t('errServer')(response.status), 'server_error');
    }

    return data;
  }

  TA.api = {
    ApiError,
    generateFormativka(payload) {
      return postJson('/api/formativka', payload);
    },
    analyzeGrades(payload) {
      return postJson('/api/analyze', payload);
    },
  };
})(window.TA);
