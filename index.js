import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const port = process.env.PORT || 5000;

// Create a MySQL connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'mydatabase',
});

// Connect to MySQL
connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL:', error);
    return;
  }
  console.log('Connected to MySQL database');
});

// Create 'users' table if it doesn't exist
connection.query(
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    gender VARCHAR(255),
    email VARCHAR(255),
    password VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    zip VARCHAR(255),
    country VARCHAR(255),
    areasOfInterest VARCHAR(255),
    profilePicture VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  (error) => {
    if (error) {
      console.error('Error creating users table:', error);
    } else {
      console.log('Users table created or already exists');
    }
  }
);

// create a new user
app.post('/users', (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    email,
    password,
    city,
    state,
    zip,
    country,
    areasOfInterest,
    profilePicture,
  } = req.body;

  const query = `INSERT INTO users (firstName, lastName, gender, email, password, city, state, zip, country, areasOfInterest, profilePicture) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(
    query,
    [
      firstName,
      lastName,
      gender,
      email,
      password,
      city,
      state,
      zip,
      country,
      JSON.stringify(areasOfInterest),
      profilePicture,
    ],
    (error) => {
      if (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Error creating user' });
      } else {
        res.status(201).json({
          success: true,
          message: 'Member Added Successfully',
        });
      }
    }
  );
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = '${email}'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error finding user' });
      return;
    }

    if (results.length === 0) {
      res.status(200).json({
        success: false,
        message: 'No email id found! Please Register',
      });
      return;
    }

    const user = results[0];

    if (user.password !== password) {
      res
        .status(200)
        .json({ success: false, message: 'Invalid email or password' });
      return;
    }

    res.json({
      success: true,
      message: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        //areasOfInterest: JSON.parse(user.areasOfInterest),
        profilePicture: user.profilePicture,
      },
    });
  });
});

// app.get('/allUsers', (req, res) => {
//   const query = 'SELECT * FROM users ORDER BY createdAt DESC';

//   connection.query(query, (error, results) => {
//     if (error) {
//       console.error(error);
//       res.status(500).json({ success: false, message: 'Error finding users' });
//       return;
//     }

//     res.json({
//       success: true,
//       message: results,
//     });
//   });
// });

app.get('/allUsers', (req, res) => {
  const query = 'SELECT * FROM users ORDER BY createdAt DESC';

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error finding users' });
      return;
    }

    const parsedResults = results.map((result) => {
      const areasOfInterest = JSON.parse(result.areasOfInterest); // Parse the areasOfInterest field

      return {
        ...result,
        areasOfInterest, // Include the parsed areasOfInterest field in the response
      };
    });

    res.json({
      success: true,
      message: parsedResults,
    });
  });
});

app.post('/deleteUser', (req, res) => {
  const email = req.body.email;

  const query = `DELETE FROM users WHERE email = '${email}'`;

  connection.query(query, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting user' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(200).json({ success: false, message: 'Member not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Member deleted successfully',
    });
  });
});

app.post('/getUser', (req, res) => {
  const email = req.body.email;

  const query = `SELECT * FROM users WHERE email = '${email}'`;

  connection.query(query, (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error finding users' });
      return;
    }

    res.json({
      success: true,
      message: results,
    });
  });
});

app.post('/updateUser', (req, res) => {
  const {
    firstName,
    lastName,
    gender,
    email,
    password,
    city,
    state,
    zip,
    country,
    areasOfInterests,
    profilePicture,
  } = req.body;

  const query = `UPDATE users SET 
    firstName = '${firstName}',
    lastName = '${lastName}',
    gender = '${gender}',
    password = '${password}',
    city = '${city}',
    state = '${state}',
    zip = '${zip}',
    country = '${country}',
    areasOfInterest = '${areasOfInterests}',
    profilePicture = '${profilePicture}'
    WHERE email = '${email}'`;

  connection.query(query, (error, result) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Error updating user' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'User updated successfully',
    });
  });
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'shivampatelbe@gmail.com',
      pass: 'Me131151*',
    },
  });

  const mailOptions = {
    from: 'shivampatelbe@gmail.com',
    to: email,
    subject: 'Password reset request',
    text: `Your Password is `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send password reset email' });
    } else {
      console.log(`Password reset email sent: ${info.response}`);
      res.json({ message: 'Password reset email sent' });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
