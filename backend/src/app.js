const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'https://portfolio2-khxf.vercel.app',
    process.env.ADMIN_URL || 'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
  ],
  credentials: true,
}));

// Rate limiting
app.use('/api/messages', rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Too many requests' }));
app.use('/api/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/hero',         require('./routes/hero'));
app.use('/api/about',        require('./routes/about'));
app.use('/api/projects',     require('./routes/projects'));
app.use('/api/skills',       require('./routes/skills'));
app.use('/api/experience',   require('./routes/experience'));
app.use('/api/education',    require('./routes/education'));
app.use('/api/certificates', require('./routes/certificates'));
app.use('/api/services',     require('./routes/services'));
app.use('/api/testimonials', require('./routes/testimonials'));
app.use('/api/messages',     require('./routes/messages'));
app.use('/api/blog',         require('./routes/blog'));
app.use('/api/settings',     require('./routes/settings'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', timestamp: new Date(), env: process.env.NODE_ENV })
);

// 404
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use(errorHandler);

module.exports = app;
