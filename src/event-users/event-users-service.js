const EventUsersService = {
  getAllEventUsers(knex) {
    return knex.raw(
      `
      SELECT eu.event_id, eu.user_id, eu.role_id, u.name
      FROM event_users as eu
      JOIN users as u
      ON eu.user_id = u.id
      `
    );
  },
  getById(knex, id) {
    return knex.raw(
      `
      SELECT eu.event_id, eu.user_id, eu.role_id, u.name
      FROM event_users as eu
      JOIN users as u
      ON eu.user_id = u.id
      WHERE eu.event_id = ${id}
      `
    );
  },
  insertEventUser(knex, newEventUser) {
    return knex
      .insert(newEventUser)
      .into('event_users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteEventUser(knex, event_id) {
    return knex('event_users')
      .where({event_id})
      .delete();
  },
  updateEventUser(knex, id, newEventFields) {
    return knex('event_users')
      .where({id})
      .update(newEventFields);
  },
  getByEventAndUserId(knex, event_id, user_id) {
    return knex.raw(
      `SELECT * FROM event_users as eu WHERE eu.event_id = ${event_id} and eu.user_id = ${user_id}`
    );
  },
  deleteByEventAndUserId(knex, event_id, user_id) {
    return knex.raw(
      `DELETE
      FROM event_users as eu 
      WHERE eu.event_id = ${event_id} and eu.user_id = ${user_id}`
    );
  },
};

module.exports = EventUsersService;
