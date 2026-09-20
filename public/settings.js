'use strict';

window.TA = window.TA || {};

(function (TA) {
  var STORAGE_KEY = 'ta_api_key';
  var listeners = [];

  function getApiKey() {
    try {
      return (window.localStorage.getItem(STORAGE_KEY) || '').trim();
    } catch (e) {
      return '';
    }
  }

  function setApiKey(key) {
    try {
      if (key) window.localStorage.setItem(STORAGE_KEY, key.trim());
      else window.localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    listeners.forEach(function (fn) { fn(getApiKey()); });
  }

  function maskKey(key) {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.slice(0, 6) + '••••' + key.slice(-4);
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  TA.settings = {
    getApiKey: getApiKey,
    setApiKey: setApiKey,
    maskKey: maskKey,
    onChange: onChange,
  };
})(window.TA);
