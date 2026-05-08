const express = require('express');
const cors = require('cors');
const YAML = require('yamljs');
const swaggerUI = require('swagger-ui-express');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/v1/authRoutes');
const taskRoutes = require('./routes/v1/taskRoutes');
const adminRoutes = require('./routes/v1/adminRoutes');

const app = express();

// Connect to DB
connectDB();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger docs
try {
  const swaggerDoc = YAML.load(path.join(__dirname, '../swagger.yaml'));
  app.use('/api/v1/docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc));
} catch (e) {
  console.log('Swagger file not found, skipping docs route');
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running', env: process.env.NODE_ENV });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 & Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api/v1/docs`);
});

module.exports = app;
