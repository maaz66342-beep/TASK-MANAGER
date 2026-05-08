const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

// SQLite - no installation needed, just a local file!
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite'),
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ SQLite connected successfully');
    await sequelize.sync({ alter: true });
    console.log('✅ Database synced');
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
