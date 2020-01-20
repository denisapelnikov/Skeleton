const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const nunjucks = require('nunjucks');

const ErrorHandler = require('./middleware/errorHandler');
const AppError = require('./services/appError');

// Start express app
const app = express();

app.locals = {
  siteDescription: 'siteDescription',
  siteKeywords: 'siteKeywords',
  siteTitle: 'siteTitle'
};

app.enable('trust proxy');

// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.app.com, front-end app.com
// app.use(cors({
//   origin: 'https://www.app.com'
// }))

app.options('*', cors());

// View engine setup
nunjucks.configure('views', {
  autoescape: true,
  express: app
});
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Prevent NoSQL query injection
app.use(mongoSanitize());

// Prevent XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: []
  })
);

app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// Routes

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(ErrorHandler);

module.exports = app;
