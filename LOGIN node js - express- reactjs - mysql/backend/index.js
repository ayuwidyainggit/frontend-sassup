import express from 'express';
import dotenv from 'dotenv';
import db from './config/Database.js';
// import Users from './models/UserModel.js';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'; //untuk parsing cookie dr refreshToken
import cors from 'cors';

dotenv.config();
const app = express();
// untuk memastika fungsi database berjalan dengan baik, gunakan try and catch
try {
  await db.authenticate();
  //   await Users.sync(); //berfungsi jika tdk terdapat tabel maka sequelize akan mengenerate database
  console.log('database connected...');
} catch (error) {
  console.log(error);
}

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(cookieParser()); //gunakan dlm bentuk middleware
app.use(express.json()); //berfungsi agar kita bisa menerima data dalam bentuk json
app.use(router);

app.listen(5000, () => console.log('Server running at port 5000'));
