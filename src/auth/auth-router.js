const express = require('express');
const AuthService = require('./auth-service');

const authRouter = express.Router();
const bodyParser = express.json();

authRouter.post('/login', bodyParser, (req, res, next) => {
  const {name, password} = req.body;
  const loginUser = {name, password};

  for (const [key, value] of Object.entries(loginUser))
    if (value == null)
      return res.status(400).json({
        error: `Missing '${key}' in request body`,
      });

  AuthService.getUserWithUserName(
    req.app.get('db'),
    loginUser.name
  )
    .then(dbUser => {
      if (!dbUser)
        return res.status(400).json({
          error: 'Incorrect user_name or password',
        });

      return AuthService.comparePasswords(
        loginUser.password,
        dbUser.password
      ).then(compareMatch => {
        if (!compareMatch)
          return res.status(400).json({
            error: 'Incorrect user_name or password',
          });

        const sub = dbUser.name;
        const payload = {user_id: dbUser.id};
        res.send({
          authToken: AuthService.createJwt(sub, payload),
          id: dbUser.id
        });
      });
    })
    .catch(next);
});

module.exports = authRouter;
