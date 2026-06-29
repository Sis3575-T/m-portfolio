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

    const [projects, blogs, skills, pages, services] = await Promise.all([
      Project.find({
        $or: [{ title: regex }, { description: regex }, { technologies: regex }],
      }).select('title slug').limit(10).lean(),

      Blog.find({
        $or: [{ title: regex }, { excerpt: regex }, { content: regex }, { tags: regex }],
      }).select('title slug').limit(10).lean(),

      Skill.find({
        $or: [{ name: regex }, { category: regex }],
      }).select('name category').limit(10).lean(),

      Page.find({
        $or: [{ title: regex }, { description: regex }, { metaTitle: regex }],
      }).select('title slug').limit(10).lean(),

      Service.find({
        $or: [{ title: regex }, { description: regex }],
      }).select('title').limit(10).lean(),
    ]);

    if (projects.length) results.projects = projects;
    if (blogs.length) results.blogs = blogs;
    if (skills.length) results.skills = skills;
    if (pages.length) results.pages = pages;
    if (services.length) results.services = services;

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
