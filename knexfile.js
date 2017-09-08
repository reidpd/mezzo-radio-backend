// Update with your config settings.

module.exports = {
  development: {
    client: 'pg',
    connection: { user: 'rpd-air', database: 'mezzo_radio' },
  },
  production: { client: 'pg', connection: process.env.DATABASE_URL }
};
