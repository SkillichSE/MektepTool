'use strict';

// Подменяет '@anthropic-ai/sdk' заглушкой, чтобы тесты не ходили в сеть
// и работали даже без `npm install`. Подключать ДО require('../lib/anthropic').
const Module = require('node:module');

const state = {
  impl: async () => ({ content: [{ type: 'text', text: '# ok' }] }),
  calls: [],
  constructed: [],
  reset() {
    this.calls.length = 0;
    this.constructed.length = 0;
    this.impl = async () => ({ content: [{ type: 'text', text: '# ok' }] });
  },
};

class FakeAnthropic {
  constructor(options) {
    state.constructed.push(options);
    this.messages = {
      create: async (params) => {
        state.calls.push(params);
        return state.impl(params);
      },
    };
  }
}

const originalLoad = Module._load;
Module._load = function patchedLoad(request, ...rest) {
  if (request === '@anthropic-ai/sdk') return FakeAnthropic;
  return originalLoad.call(this, request, ...rest);
};

module.exports = state;
