exports.seed = function (knex, Promise) {
  //Deletes All existing entries
  return knex('users').del().then(() => {
    //Inserts seed entries
    return knex('users').insert([
      {
        id: 1,
        spotify_id: 'not_ready_yet',
        images: '',
        email: '',
        display_name: '',
        created_at: new Date('2016-06-21 14:26:16 UTC'),
        updated_at: new Date('2016-06-21 14:26:16 UTC'),
      },
      {
        id: 2,
        spotify_id: 'not_ready_yet_2',
        images: '',
        email: '',
        display_name: '',
        created_at: new Date('2016-06-22 14:26:16 UTC'),
        updated_at: new Date('2016-06-22 14:26:16 UTC'),
      },
    ]);
  }).then(() => {
    return knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));");
  });
};
