const express = require('express');
const router = express.Router();

const Page = require('../models/Page');
const Section = require('../models/Section');
const Settings = require('../models/Settings');
const Hero = require('../models/Hero');
const About = require('../models/About');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certificate = require('../models/Certificate');
const Testimonial = require('../models/Testimonial');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const Timeline = require('../models/Timeline');

// Pages
router.get('/pages', async (req, res) => {
  try {
    const pages = await Page.find({ status: 'published' })
      .select('name slug components seo publishedAt updatedAt')
      .sort('order');
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/pages/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, status: 'published' });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    const sections = (page.sections || []).filter(s => s.visible !== false).sort((a, b) => (a.order || 0) - (b.order || 0));
    res.json({ success: true, data: { ...page.toObject(), sections } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Sections
router.get('/sections', async (req, res) => {
  try {
    const sections = await Section.find({ status: 'published' }).sort('order');
    res.json({ success: true, data: sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Settings (public - no secrets)
router.get('/settings', async (req, res) => {
  try {
    const settings = await Settings.findOne().select('-__v');
    if (!settings) return res.json({ success: true, data: null });
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// About
router.get('/about', async (req, res) => {
  try {
    const about = await About.findOne({ status: 'published' });
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Hero
router.get('/hero', async (req, res) => {
  try {
    let hero = await Hero.findOne({ status: 'published' });
    if (!hero) hero = await Hero.findOne({ isActive: true });
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find({ status: 'published' }).sort({ featured: -1, order: 1 });
    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Skills
router.get('/skills', async (req, res) => {
  try {
    const skills = await Skill.find({ status: 'published' }).sort({ category: 1, order: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Experience
router.get('/experience', async (req, res) => {
  try {
    const items = await Experience.find({ status: 'published' }).sort({ startDate: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Education
router.get('/education', async (req, res) => {
  try {
    const items = await Education.find({ status: 'published' }).sort({ startDate: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Certificates
router.get('/certificates', async (req, res) => {
  try {
    const items = await Certificate.find({ $or: [{ status: 'published' }, { status: 'verified' }] }).sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Testimonials
router.get('/testimonials', async (req, res) => {
  try {
    const items = await Testimonial.find({ status: 'published' }).sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Services
router.get('/services', async (req, res) => {
  try {
    const items = await Service.find({ status: 'published' }).sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Blog
router.get('/blog', async (req, res) => {
  try {
    const posts = await Blog.find({ status: 'published' }).sort({ publishedAt: -1 });
    res.json({ success: true, data: posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Timeline
router.get('/timeline', async (req, res) => {
  try {
    const items = await Timeline.find({ status: 'published' }).sort({ order: 1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Site config (sections + settings in one call)
router.get('/site-config', async (req, res) => {
  try {
    const sections = await Section.find({ status: 'published', visible: true }).sort('order').lean();
    const settings = await Settings.findOne().select('-__v').lean();
    const navItems = await Page.find({ status: 'published' }).select('name slug').sort('order').lean();
    res.json({ success: true, data: { sections, settings, navItems } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Contact form submission
router.post('/contact', async (req, res) => {
  try {
    const Message = require('../models/Message');
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required' });
    }
    await Message.create({
      name,
      email,
      subject: subject || 'Contact Form Message',
      message,
      isRead: false,
      createdAt: new Date(),
    });
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
