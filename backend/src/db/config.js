const pgPromise = require('pg-promise');

const pgp = pgPromise();

const connection = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/postgres';

const db = pgp(connection);

module.exports = db;
