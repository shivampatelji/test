// db.js
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('mydatabase', 'root', 'password', {
  host: 'localhost',
  dialect: 'mysql',
});

// Test the database connection
sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to the database');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

export default sequelize;
