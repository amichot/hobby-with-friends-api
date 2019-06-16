const express = require('express');
const EventsService = require('./events-service');
const xss = require('xss');

const logger = require('../logger');

const eventsRouter = express.Router();
const bodyParser = express.json();
const {getEventValidationError} = require('./event-validator');

const serializeEvent = event => ({
  id: event.id,
  owner: xss(event.owner),
  name: xss(event.name),
  tags: xss(event.tags),
  location: xss(event.description),
  date: event.date,
  information: xss(event.information),
  attending: xss(event.attending),
});

eventsRouter
  .route('/')
  .get((req, res, next) => {
    EventsService.getAllEvents(req.app.get('db'))
      .then(events => {
        res.json(events.map(EventsService.serializeEvent));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const {
      owner,
      name,
      tags,
      location,
      date,
      information,
      attending,
    } = req.body;
    const newEvent = {
      owner,
      name,
      tags,
      location,
      date,
      information,
      attending,
    };

    for (const field of [owner, name, tags, location, date, information]) {
      if (!newEvent[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send({
          error: {message: `'${field}' is required`},
        });
      }
    }

    const error = getEventValidationError(newEvent);

    if (error) return res.status(400).send(error);

    EventsService.insertEvent(req.app.get('db'), newEvent)
      .then(event => {
        logger.info(`Event with id ${event.id} created.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${event.id}`))
          .json(serializeEvent(event));
      })
      .catch(next);
  });

eventsRouter
  .route('/:event_id')
  .all(checkEventExists)
  .get((req, res) => {
    res.json(EventsService.serializeEvent(res.event));
  });

eventsRouter
  .route('/:event_id')

  .all((req, res, next) => {
    const {event_id} = req.params;
    EventsService.getById(req.app.get('db'), event_id)
      .then(event => {
        if (!event) {
          logger.error(`Event with id ${event_id} not found.`);
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
      owner,
      name,
      tags,
      location,
      date,
      information,
      attending,
    } = req.body;
    const eventToUpdate = {
      owner,
      name,
      tags,
      location,
      date,
      information,
      attending,
    };

    const numberOfValues = Object.values(eventToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      logger.error(`Invalid update without required fields`);
      return res.status(400).json({
        error: {
          message: `Request body must contain either owner, name, tags, location, information, attending`,
        },
      });
    }

    const error = getEventValidationError(eventToUpdate);

    if (error) return res.status(400).send(error);

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

module.exports = eventsRouter;
