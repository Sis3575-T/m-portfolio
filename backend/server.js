const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    if ((await User.countDocuments({ role: 'admin' })) === 0) {
      await User.create({
        name: 'Admin',
        email: process.env.ADMIN_EMAIL || 'admin@portfolio.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
      });
      console.log('Admin auto-seeded:', process.env.ADMIN_EMAIL || 'admin@portfolio.com');
    }
  } catch (err) {
    console.error('Auto-seed error:', err.message);
  }
};

const authRoutes = require('./routes/auth');
const heroRoutes = require('./routes/hero');
const aboutRoutes = require('./routes/about');
const skillRoutes = require('./routes/skills');
const projectRoutes = require('./routes/projects');
const experienceRoutes = require('./routes/experiences');
const educationRoutes = require('./routes/education');
const serviceRoutes = require('./routes/services');
const testimonialRoutes = require('./routes/testimonials');
const blogRoutes = require('./routes/blogs');
const messageRoutes = require('./routes/messages');
const mediaRoutes = require('./routes/media');
const analyticsRoutes = require('./routes/analytics');
const seoRoutes = require('./routes/seo');
const settingsRoutes = require('./routes/settings');
const certificateRoutes = require('./routes/certificates');
const pageRoutes = require('./routes/pages');
const themeRoutes = require('./routes/theme');
const backupRoutes = require('./routes/backups');
const activityLogRoutes = require('./routes/activityLogs');
const notificationRoutes = require('./routes/notifications');
const versionRoutes = require('./routes/versions');
const translationRoutes = require('./routes/translations');
const securityRoutes = require('./routes/security');
const performanceRoutes = require('./routes/performance');
const accessibilityRoutes = require('./routes/accessibility');
const searchRoutes = require('./routes/search');
const userRoutes = require('./routes/users');
const templateRoutes = require('./routes/templates');

const fs = require('fs');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();

connectDB().then(() => seedAdmin());

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: function (origin, cb) {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
      'http://localhost:5174',
    ].filter(Boolean);
    if (!origin || allowed.includes(origin)) return cb(null, true);
    cb(null, true);
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' },
});
app.use('/api/auth', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/hero', heroRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experiences', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/backups', backupRoutes);
app.use('/api/activity-logs', activityLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/versions', versionRoutes);
app.use('/api/translations', translationRoutes);
app.use('/api/security', securityRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/accessibility', accessibilityRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/users', userRoutes);
app.use('/api/templates', templateRoutes);

// Sitemap generation
app.get('/api/sitemap.xml', async (req, res) => {
  try {
    const Page = require('./models/Page');
    const Blog = require('./models/Blog');
    const Project = require('./models/Project');
    const pages = await Page.find({ isPublished: true }).select('slug updatedAt').lean();
    const blogs = await Blog.find({ isActive: true }).select('slug updatedAt').lean();
    const projects = await Project.find({ isActive: true }).select('slug updatedAt').lean();
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url><loc>${baseUrl}/</loc><priority>1.0</priority></url>\n`;
    pages.forEach(p => { xml += `  <url><loc>${baseUrl}/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><priority>0.9</priority></url>\n`; });
    blogs.forEach(b => { xml += `  <url><loc>${baseUrl}/blog/${b.slug}</loc><lastmod>${b.updatedAt.toISOString()}</lastmod><priority>0.7</priority></url>\n`; });
    projects.forEach(p => { xml += `  <url><loc>${baseUrl}/project/${p.slug}</loc><lastmod>${p.updatedAt.toISOString()}</lastmod><priority>0.7</priority></url>\n`; });
    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    res.status(500).send('Error generating sitemap');
  }
});

app.get('/robots.txt', (req, res) => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${baseUrl}/api/sitemap.xml\n`);
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'Portfolio CMS API',
    version: '1.0.0',
    status: 'operational',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      admin: '/api/auth/login',
      docs: 'See README for full API documentation',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Portfolio API is running', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Max 50MB allowed.' });
  }
  if (err.message === 'Invalid file type') {
    return res.status(400).json({ success: false, message: 'Invalid file type. Allowed: jpg, png, gif, webp, pdf, doc, docx.' });
  }
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
