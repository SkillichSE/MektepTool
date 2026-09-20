'use strict';


const limits = {
  topicMax: 800,
  notesMax: 500,
  countMin: 1,
  countMax: 20,
  tableRowsMax: 200,
  tableColsMax: 30,
  cellMax: 200,
};

function readEnv() {
  return {
    nodeEnv: process.env.NODE_ENV || 'production',
    isProduction: (process.env.NODE_ENV || 'production') === 'production',
    port: Number(process.env.PORT) || 3000,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
    anthropicModel: process.env.ANTHROPIC_MODEL || 'claude-sonnet-5',
    allowedOrigins: (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  };
}

module.exports = { limits, readEnv };
