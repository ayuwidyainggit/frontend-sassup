import { Sequelize } from 'sequelize';
import db from '../config/Database.js';

const { DataTypes } = Sequelize;
//DataTypes adalah fungsi dari sequelize
const Users = db.define(
  'users',
  {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    refresh_token: DataTypes.TEXT,
  },
  {
    freezeTableName: true,
  }
);

export default Users;

// membuat function (asyncronus) untuk generate table user jika user tdk terdapat di db

(async () => {
  await db.sync();
})();
