const UsersService = {
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
