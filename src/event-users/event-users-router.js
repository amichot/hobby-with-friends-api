const path = require('path');
const express = require('express');
const xss = require('xss');
const EventUsersService = require('./event-users-service');

const logger = require('../logger');

const eventUsersRouter = express.Router();
const bodyParser = express.json();

const serializeEventUser = event_user => ({
  event_id: Number(event_user.event_id),
  user_id: Number(event_user.user_id),
  role_id: Number(event_user.role_id),
  user_name: xss(event_user.name),
});

eventUsersRouter
  .route('/')
  .get((req, res, next) => {
    EventUsersService.getAllEventUsers(req.app.get('db'))
      .then(eventUsers => {
        res.json(eventUsers.rows.map(serializeEventUser));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const event_id = Number(req.body.event_id);
    const user_id = Number(req.body.user_id);
    const role_id = Number(req.body.role_id);
    const newEventUser = {
      event_id,
      user_id,
      role_id,
    };

    for (const field of [
      'event_id',
      'user_id',
      'role_id',
    ]) {
      if (!newEventUser[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: {message: `'${field}' is required`},
        });
      }
    }

    EventUsersService.insertEventUser(
      req.app.get('db'),
      newEventUser
    )
      .then(eventUser => {
        logger.info(
          `Event with id ${
            eventUser.event_id
          } added user with id 
          ${eventUser.user_id}.`
        );
        res
          .status(201)
          .location('back')
          .json(serializeEventUser(eventUser));
      })
      .catch(next);
  });

eventUsersRouter
  .route('/:event_id')

  .all((req, res, next) => {
    const {event_id} = req.params;
    EventUsersService.getById(req.app.get('db'), event_id)
      .then(eventUsers => {
        if (!eventUsers) {
          logger.error(
            `EventUsers with id ${event_id} not found.`
          );
          return res.status(404).json({
            error: {message: `EventUsers Not Found`},
          });
        }

        res.eventUsers = eventUsers;
        console.log(res.eventUsers);
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    console.log(res.eventUsers);
    res.json(res.eventUsers.rows.map(serializeEventUser));
  })

  .delete((req, res, next) => {
    const {event_id} = req.params;
    EventUsersService.deleteEventUser(
      req.app.get('db'),
      event_id
    )
      .then(numRowsAffected => {
        logger.info(
          `Event with id ${event_id} deleted. Number of rows affected ${numRowsAffected}`
        );
        res.status(204).end();
      })
      .catch(next);
  });

eventUsersRouter
  .route('/:event_id/:user_id')

  .all((req, res, next) => {
    const {event_id, user_id} = req.params;
    EventUsersService.getByEventAndUserId(
      req.app.get('db'),
      event_id,
      user_id
    )
      .then(eventUser => {
        if (!eventUser) {
          logger.error(
            `EventUsers with event id ${event_id} and user id ${user_id} not found.`
          );
          return res.status(404).json({
            error: {message: `EventUsers Not Found`},
          });
        }

        res.eventUser = eventUser;
        next();
      })
      .catch(next);
  })

  .delete((req, res, next) => {
    const {event_id, user_id} = req.params;
    EventUsersService.deleteByEventAndUserId(
      req.app.get('db'),
      event_id,
      user_id
    )
      .then(numRowsAffected => {
        logger.info(
          `Event with event id ${event_id} and user id ${user_id} deleted.}`
        );
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = eventUsersRouter;
