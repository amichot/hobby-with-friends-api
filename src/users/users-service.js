const bcrypt = require('bcryptjs');
const xss = require('xss');

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersService = {
  hasUserWithUserName(db, name) {
    return db('users')
      .where({name})
      .first()
      .then(user => !!user);
  },
  insertUser(db, newUser) {
    return db
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(([user]) => user);
  },
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (
      password.startsWith(' ') ||
      password.endsWith(' ')
    ) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },
  getAllUsers(knex) {
    return knex.select('*').from('users');
  },
  getById(knex, id) {
    return knex
      .from('users')
      .select('*')
      .where('id', id)
      .first();
  },
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteUser(knex, id) {
    return knex('users')
      .where({id})
      .delete();
  },
  updateUser(knex, id, newUserFields) {
    return knex('users')
      .where({id})
      .update(newUserFields);
  },
};

module.exports = UsersService;
