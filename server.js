const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

let config = {
  port: 3000
};

const startApp = async () => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('NODE_ENV development');

      config = {
        path: `${__dirname}/env/.env.development.local`
      };
    } else if (process.env.NODE_ENV === 'production') {
      console.log('NODE_ENV production');
      config = {
        path: `${__dirname}/env/.env.production.local`
      };
    } else if (process.env.NODE_ENV === 'test') {
      console.log('NODE_ENV test');
      config = {
        path: `${__dirname}/env/.env.test.local`
      };
    } else {
      throw new Error(`NODE_ENV UNKNOWN`);
    }

    const result = dotenv.config({
      path: config.path
    });

    if (result.error) throw new Error(result.error);

    const port = process.env.PORT || config.port;

    // Connecting to database
    await mongoose.connect(process.env.DATABASE, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    // Run server
    const server = app.listen(port, () =>
      console.log(`Application running on port ${port}...`)
    );

    process.on('uncaughtException', err => {
      console.log('UNCAUGHT EXCEPTION! Shutting down...');
      if (process.env.NODE_ENV === 'development') console.log(err);
      process.exit(1);
    });

    process.on('unhandledRejection', error => {
      console.log('UNHANDLED REJECTION! Shutting down...');
      if (process.env.NODE_ENV === 'development') console.log(error);
      server.close(() => process.exit(1));
    });

    process.on('SIGTERM', () => {
      console.log('SIGTERM RECEIVED. Shutting down...');
      server.close(() => console.log('Process terminated...'));
    });

    mongoose.connection.on('connected', () =>
      console.log('Database connection successful...')
    );

    mongoose.connection.on('error', error => {
      console.log('Database connection error...');
      console.log('UNHANDLED REJECTION! Shutting down...');
      if (process.env.NODE_ENV === 'development') console.log(error);
      server.close(() => process.exit(1));
    });
  } catch (err) {
    console.log(err);
  }
};

startApp();
