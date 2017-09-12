
exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', (table) => {
    table.increments();
    table.string('spotify_id').unique().notNullable();
    table.string('images').notNullable().defaultTo('');
    table.string('email').notNullable().defaultTo('');
    table.string('display_name').notNullable().defaultTo('');
    table.string('access_token').notNullable().defaultTo('');
    table.string('refresh_token').notNullable().defaultTo('');
    table.string('authorization_code').notNullable().defaultTo('');
    table.timestamps(true, true);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('users');
};
