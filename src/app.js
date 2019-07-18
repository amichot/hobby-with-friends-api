require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {CLIENT_ORIGIN} = require('./config');
const {NODE_ENV} = require('./config');
const errorHandler = require('./error-handler');

const authRouter = require('./auth/auth-router');
const eventsRouter = require('./events/events-router');
const usersRouter = require('./users/users-router');
const eventUsersRouter = require('./event-users/event-users-router');

const app = express();

const morganOption =
  NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(cors({
  origin: CLIENT_ORIGIN
}));
app.use(helmet());

app.use('/api/auth', authRouter);
app.use('/api/event', eventsRouter);
app.use('/api/user', usersRouter);
app.use('/api/event-users', eventUsersRouter);

app.get('/api', (req, res) => {
  res.send('Hello, world!');
});

app.use(errorHandler);

module.exports = app;
