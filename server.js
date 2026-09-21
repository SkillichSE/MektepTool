'use strict';

require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { readEnv } = require('./lib/config');
const { HttpError } = require('./lib/errors');
const { handleFormativka, handleAnalyze } = require('./lib/handlers');
const { t } = require('./lib/i18n');

const env = readEnv();
const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1); // корректный req.ip за nginx/балансировщиком

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net', 'https://cdnjs.cloudflare.com'],
        styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  })
);
app.use(compression());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.length === 0 || env.allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new HttpError(403, t().corsForbidden, 'cors_forbidden'));
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.isProduction ? 'combined' : 'dev'));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: (req) => ({ error: t(req.body && req.body.lang).tooManyRequests }),
});
app.use('/api/', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.post('/api/formativka', asyncRoute(async (req, res) => {
  res.json(await handleFormativka(req.body));
}));

app.post('/api/analyze', asyncRoute(async (req, res) => {
  res.json(await handleAnalyze(req.body));
}));

app.use(
  express.static(path.join(__dirname, 'public'), {
    extensions: ['html'],
    maxAge: env.isProduction ? '1h' : 0,
  })
);

app.use((req, res) => {
  res.status(404).json({ error: t(req.body && req.body.lang).routeNotFound });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, code: err.code });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ error: t(req.body && req.body.lang).internalError });
});

function asyncRoute(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

if (require.main === module) {
  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] слушает на порту ${env.port} (${env.nodeEnv})`);
  });
}

module.exports = app;
