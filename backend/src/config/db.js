// Minimal Sequelize init
const { Sequelize } = require('sequelize');
require('dotenv').config();

const {
  DB_HOST = 'localhost',
  DB_PORT = 5432,
  DB_NAME = 'bib_esprim_db',
  DB_USER = 'postgres',
  DB_PASSWORD = 'hanen222',
  DATABASE_URL
} = process.env;

const sequelize = DATABASE_URL
  ? new Sequelize(DATABASE_URL, { dialect: 'postgres', logging: false })
  : new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
      host: DB_HOST,
      port: DB_PORT,
      dialect: 'postgres',
      logging: false
    });

module.exports = sequelize;