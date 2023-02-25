import { Sequelize } from 'sequelize';
const db = new Sequelize('my_app', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

export default db;
