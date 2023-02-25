import Users from '../models/UserModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      attributes: ['id', 'name', 'email'],
    });
    res.json(users);
  } catch (error) {
    console.log(error);
  }
};

export const Register = async (req, res) => {
  try {
    const { name, email, password, confPassword } = req.body;
    const username = await Users.findAll({
      where: {
        name: req.body.name,
      },
    });
    const hasil1 = username[0].name;
    const hasilEmail = username[0].email;
    // res.json(hasil1);

    if (password !== confPassword) {
      return res.status(400).json({ msg: 'Password and Confirm Password is not match' });
    } else if (name === hasil1 || email === hasilEmail) {
      return res.status(400).json({ msg: 'nama sudah pernah digunakan  ' });
    }
  } catch (error) {
    const { name, email, password, confPassword } = req.body;
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);
    try {
      await Users.create({
        name: name,
        email: email,
        password: hashPassword,
      });
      res.json({ msg: 'Register Successfully' });
    } catch (error) {
      console.log(error);
    }
  }
};

export const Login = async (req, res) => {
  try {
    const user = await Users.findAll({
      where: {
        email: req.body.email,
        //ini digunakan untuk mencari user menggunakan email karena kita login menggunakan email
      },
    });

    // jika user ditemukan, maka kita akan membandingkan pass yang di kirim client dengan pass yang ada di DB
    const match = await bcrypt.compare(req.body.password, user[0].password); //ini digunakan untuk mengkompare pass yang di kirim client dengan yang ada di db
    if (!match) return res.status(400).json({ msg: 'Wrong password' }); //jika pass tidak cocok maka akan mengirimkan message ini
    //jika pass cocok maka akan construct satu persatu userId, name dan email nya, kita pake index ke  0 karene single data
    const userId = user[0].id;
    const name = user[0].name;
    const email = user[0].email;
    //buat access token , kasih payload , parameter 1 dlm bentuk object , parameter ke 2 ambil dr environtmentnya
    const accessToken = jwt.sign({ userId, name, email }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: '20s', //dibuat exp dlm waktu 20 detik
    });

    const refreshToken = jwt.sign({ userId, name, email }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: '1d', //dibuat exp dlm 1 hari
    });

    //simpan value dr variabel refreshToken  ke database, update berdasarkan id
    await Users.update(
      { refresh_token: refreshToken },
      {
        where: {
          id: userId,
        },
      }
    );
    // setelah refreshToken disimpan ke db, kita buat httpOnly cookie yang akan dikirimkan ke client
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, //membuat cookie exp 1 hari
      // jika menggunakan https, tambahkan secure: true , (tidak perlu karena masih di server local )
    });
    res.json({ accessToken }); //kirim access token
  } catch (error) {
    res.status(404).json({ msg: 'Email Tidak ditemukan' }); //ini jika email tidak di temukan
  }
};

export const Logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(204);
  const user = await Users.findAll({
    where: {
      refresh_token: refreshToken,
    },
  });
  if (!user[0]) return res.sendStatus(204);
  const userId = user[0].id;
  await Users.update(
    { refresh_token: null },
    {
      where: {
        id: userId,
      },
    }
  );
  res.clearCookie('refreshToken');
  return res.sendStatus(200);
};
