module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL:
    process.env.DATABASE_URL ||
    'postgresql://dunder-mifflin:1@localhost/hobby-with-friends',
  JWT_SECRET:
    process.env.JWT_SECRET || 'change-this-secret',
  CLIENT_ORIGIN:
    'https://hobby-with-friends.adrianslolacc.now.sh',
};
