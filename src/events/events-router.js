const path = require('path');
const express = require('express');

const EventUsersService = require('../event-users/event-users-service');
const EventsService = require('./events-service');
const {requireAuth} = require('../middleware/jwt-auth');
const xss = require('xss');

const logger = require('../logger');

const eventsRouter = express.Router();
const bodyParser = express.json();

const serializeEvent = event => ({
  id: event.id,
  owner_id: Number(event.owner_id),
  owner_name: xss(event.owner_name),
  name: xss(event.name),
  type: xss(event.type),
  location: xss(event.location),
  date: Number(event.date),
  information: xss(event.information),
});

eventsRouter
  .route('/')
  .all(requireAuth)
  .get((req, res, next) => {
    EventsService.getAllEvents(req.app.get('db'))
      .then(events => {
        res.json(events.rows.map(serializeEvent));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    console.log('create body....', req.body);
    const {
      owner_id,
      name,
      type,
      location,
      information,
    } = req.body.event;
    const date = Number(req.body.event.date);
    const newEvent = {
      name,
      type,
      location,
      date,
      information,
    };
    const newEventUser = {
      event_id: null,
      user_id: owner_id,
      role_id: 1,
    };

    for (const field of [
      'name',
      'type',
      'location',
      'date',
    ]) {
      if (!newEvent[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: {message: `'${field}' is required`},
        });
      }
      if (!newEventUser.user_id) {
        logger.error(`owner_id is required`);
        return res.status(400).send({
          error: {message: `owner_id is required`},
        });
      }
    }

    EventsService.insertEvent(req.app.get('db'), newEvent)
      .then(event => {
        newEventUser.event_id = event.id;
        EventUsersService.insertEventUser(
          req.app.get('db'),
          newEventUser
        );
        logger.info(`Event with id ${event.id} created.`);
        return res
          .status(201)
          .location(
            path.posix.join(req.originalUrl, `${event.id}`)
          )
          .json(serializeEvent(event));
      })
      .catch(next);
  });

eventsRouter
  .route('/id/:event_id')
  .all(requireAuth)
  .all((req, res, next) => {
    const {event_id} = req.params;
    EventsService.getById(req.app.get('db'), event_id)
      .then(event => {
        if (!event) {
          logger.error(
            `Event with id ${event_id} not found.`
          );
          return res.status(404).json({
            error: {message: `Event Not Found`},
          });
        }

        res.event = event;
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(serializeEvent(res.event));
  })

  .delete((req, res, next) => {
    const {event_id} = req.params;
    EventsService.deleteEvent(req.app.get('db'), event_id)
      .then(numRowsAffected => {
        logger.info(`Event with id ${event_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const {
      name,
      type,
      location,
      date,
      information,
    } = req.body;

    const eventToUpdate = {
      name,
      type,
      location,
      date,
      information,
    };

    const numberOfValues = Object.values(
      eventToUpdate
    ).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(
        `Invalid update without required fields`
      );
      return res.status(400).json({
        error: {
          message: `Request body must contain either owner, name, type, location, information, attending`,
        },
      });
    }

    EventsService.updateEvent(
      req.app.get('db'),
      req.params.event_id,
      eventToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

eventsRouter
  .route('/filter')
  .all(requireAuth)
  .post(bodyParser, (req, res, next) => {
    console.log(req.body);
    const {name, type, location} = req.body;
    const date = Number(req.body.date);
    const criteria = {
      name,
      type,
      location,
      date,
    };
    EventsService.filterEvents(req.app.get('db'), criteria)
      .then(events => {
        res.json(events.rows.map(serializeEvent));
      })
      .catch(next);
  });

module.exports = eventsRouter;
