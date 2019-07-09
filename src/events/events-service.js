const EventsService = {
  getAllEvents(knex) {
    return knex.raw(
      `SELECT e.id, u.id as "owner_id", u.profile_name as "owner_name", e.name, e."type", e."location", e."date", e.information
       FROM events as e
       JOIN event_users as eu
       ON e.id = eu.event_id
       JOIN users as u 
       ON eu.user_id = u.id AND eu.event_id = e.id
       WHERE eu.role_id = 1;
       `
    );
  },
  getById(knex, id) {
    return knex
      .from('events')
      .select('*')
      .where('id', id)
      .first();
  },
  insertEvent(knex, newEvent) {
    return knex
      .insert(newEvent)
      .into('events')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  deleteEvent(knex, id) {
    return knex('events')
      .where({id})
      .delete();
  },
  updateEvent(knex, id, newEventFields) {
    return knex('events')
      .where({id})
      .update(newEventFields);
  },
  filterEvents(knex, criteria) {
    return knex.raw(
      `SELECT e.id, u.id as "owner_id", u.profile_name as "owner_name", e.name, e."type", e."location", e."date", e.information
       FROM events as e
       JOIN event_users as eu
       ON e.id = eu.event_id
       JOIN users as u 
       ON eu.user_id = u.id 
       AND eu.event_id = e.id
       WHERE eu.role_id = 1
       AND e.name ilike '%${criteria.name}%'
       AND e."type" ilike '%${criteria.type}%'
       AND e."location" ilike '%${criteria.location}%'
       AND e."date" >= ${criteria.date};
    `
    );
  },
};

module.exports = EventsService;
