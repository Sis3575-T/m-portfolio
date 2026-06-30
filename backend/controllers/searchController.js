const Project = require('../models/Project');
const Blog = require('../models/Blog');
const Skill = require('../models/Skill');
const Page = require('../models/Page');
const Service = require('../models/Service');

exports.searchAll = async (req, res) => {
  try {
    const { q, type = 'all' } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });

    const regex = new RegExp(q, 'i');
    const results = {};

    const searchTargets = type === 'all'
      ? ['projects', 'blogs', 'skills', 'pages', 'services']
      : [type];

    const searches = searchTargets.map(async (t) => {
      let items;
      switch (t) {
        case 'projects':
          items = await Project.find({
            $or: [
              { title: regex },
              { description: regex },
              { technologies: regex },
            ],
          }).select('title slug description').limit(10).lean();
          break;
        case 'blogs':
          items = await Blog.find({
            $or: [
              { title: regex },
              { excerpt: regex },
              { content: regex },
              { tags: regex },
            ],
          }).select('title slug excerpt').limit(10).lean();
          break;
        case 'skills':
          items = await Skill.find({
            $or: [
              { name: regex },
              { category: regex },
            ],
          }).select('name category').limit(10).lean();
          break;
        case 'pages':
          items = await Page.find({
            $or: [
              { title: regex },
              { description: regex },
              { metaTitle: regex },
            ],
          }).select('title slug description').limit(10).lean();
          break;
        case 'services':
          items = await Service.find({
            $or: [
              { title: regex },
              { description: regex },
            ],
          }).select('title description').limit(10).lean();
          break;
      }
      if (items && items.length) results[t] = items;
    });

    await Promise.all(searches);

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchProjects = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });

    const regex = new RegExp(q, 'i');
    const projects = await Project.find({
      $or: [
        { title: regex },
        { description: regex },
        { technologies: regex },
      ],
    }).sort({ createdAt: -1 }).limit(20).lean();

    res.json({ success: true, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchBlogs = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });

    const regex = new RegExp(q, 'i');
    const blogs = await Blog.find({
      $or: [
        { title: regex },
        { excerpt: regex },
        { content: regex },
        { tags: regex },
      ],
    }).sort({ publishedAt: -1 }).limit(20).lean();

    res.json({ success: true, data: blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchPages = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });

    const regex = new RegExp(q, 'i');
    const pages = await Page.find({
      $or: [
        { title: regex },
        { description: regex },
        { metaTitle: regex },
      ],
    }).sort({ order: 1 }).limit(20).lean();

    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.adminSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });

    const regex = new RegExp(q, 'i');
    const results = {};

    const [projects, blogs, skills, pages, services, education, experiences, testimonials, messages, media, settings, users] = await Promise.all([
      Project.find({ $or: [{ title: regex }, { description: regex }, { technologies: regex }] }).select('title slug').limit(10).lean(),
      Blog.find({ $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { tags: regex }] }).select('title slug').limit(10).lean(),
      Skill.find({ $or: [{ name: regex }, { category: regex }] }).select('name category').limit(10).lean(),
      Page.find({ $or: [{ title: regex }, { description: regex }, { metaTitle: regex }] }).select('title slug').limit(10).lean(),
      Service.find({ $or: [{ title: regex }, { description: regex }] }).select('title').limit(10).lean(),

      (await require('../models/Education').find({ $or: [{ institution: regex }, { degree: regex }, { field: regex }] }).select('institution degree').limit(10).lean()).filter(Boolean),
      (await require('../models/Experience').find({ $or: [{ position: regex }, { company: regex }, { description: regex }] }).select('position company').limit(10).lean()).filter(Boolean),
      (await require('../models/Testimonial').find({ $or: [{ name: regex }, { content: regex }, { role: regex }] }).select('name content').limit(10).lean()).filter(Boolean),
      (await require('../models/Message').find({ $or: [{ name: regex }, { email: regex }, { subject: regex }, { message: regex }] }).select('name email subject').limit(10).lean()).filter(Boolean),
      (await require('../models/Media').find({ $or: [{ name: regex }, { originalName: regex }] }).select('name url').limit(10).lean()).filter(Boolean),
      (await require('../models/Settings').find({ $or: [{ siteTitle: regex }, { siteDescription: regex }, { email: regex }] }).select('siteTitle email').limit(10).lean()).filter(Boolean),
      (await require('../models/User').find({ $or: [{ name: regex }, { email: regex }] }).select('name email').limit(10).lean()).filter(Boolean),
    ]);

    if (projects.length) results.projects = projects;
    if (blogs.length) results.blogs = blogs;
    if (skills.length) results.skills = skills;
    if (pages.length) results.pages = pages;
    if (services.length) results.services = services;
    if (education.length) results.education = education;
    if (experiences.length) results.experiences = experiences;
    if (testimonials.length) results.testimonials = testimonials;
    if (messages.length) results.messages = messages;
    if (media.length) results.media = media;
    if (settings.length) results.settings = settings;
    if (users.length) results.users = users;

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
