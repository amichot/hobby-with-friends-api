const path = require('path');
const express = require('express');
const UsersService = require('./users-service');
const xss = require('xss');

const logger = require('../logger');

const usersRouter = express.Router();
const bodyParser = express.json();

const serializeUser = user => ({
  id: user.id,
  name: xss(user.name),
  full_name: xss(user['full_name']),
  type: xss(user.type),
  location: xss(user.location),
  email: xss(user.email),
  about_me: xss(user['about_me']),
  date_created: new Date(user.date_created),
});

usersRouter
  .route('/')
  .get((req, res, next) => {
    UsersService.getAllUsers(req.app.get('db'))
      .then(users => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const {
      password,
      full_name,
      type,
      location,
      email,
      about_me,
    } = req.body;
    const name = req.body['name'];

    for (const field of ['full_name', 'name', 'password'])
      if (!req.body[field])
        return res.status(400).json({
          error: `Missing '${field}' in request body`,
        });

    // TODO: check name doesn't start with spaces

    const passwordError = UsersService.validatePassword(
      password
    );

    if (passwordError)
      return res.status(400).json({error: passwordError});

    UsersService.hasUserWithUserName(
      req.app.get('db'),
      name
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res
            .status(400)
            .json({error: `Username already taken`});

        return UsersService.hashPassword(password).then(
          hashedPassword => {
            const newUser = {
              name,
              password: hashedPassword,
              full_name,
              type,
              location,
              email,
              about_me,
              date_created: 'now()',
            };

            return UsersService.insertUser(
              req.app.get('db'),
              newUser
            ).then(user => {
              res
                .status(201)
                .location(
                  path.posix.join(
                    req.originalUrl,
                    `/${user.id}`
                  )
                )
                .json(serializeUser(user));
            });
          }
        );
      })
      .catch(next);
  });

usersRouter
  .route('/:user_id')

  .all((req, res, next) => {
    const {user_id} = req.params;
    UsersService.getById(req.app.get('db'), user_id)
      .then(user => {
        if (!user) {
          logger.error(
            `User with id ${user_id} not found.`
          );
          return res.status(404).json({
            error: {message: `User Not Found`},
          });
        }

        res.user = user;
        next();
      })
      .catch(next);
  })

  .get((req, res) => {
    res.json(serializeUser(res.user));
  })

  .delete((req, res, next) => {
    const {user_id} = req.params;
    UsersService.deleteUser(req.app.get('db'), user_id)
      .then(numRowsAffected => {
        logger.info(`User with id ${user_id} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  })

  .patch(bodyParser, (req, res, next) => {
    const {
      name,
      full_name,
      type,
      location,
      email,
      about_me,
    } = req.body;
    const userToUpdate = {
      name,
      full_name,
      type,
      location,
      email,
      about_me,
    };

    const numberOfValues = Object.values(
      userToUpdate
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

    UsersService.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;
