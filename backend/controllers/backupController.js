const Backup = require('../models/Backup');
const Page = require('../models/Page');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Certificate = require('../models/Certificate');
const Blog = require('../models/Blog');
const Service = require('../models/Service');
const Testimonial = require('../models/Testimonial');
const Message = require('../models/Message');
const Media = require('../models/Media');
const Setting = require('../models/Settings');
const Theme = require('../models/Theme');

exports.getBackups = async (req, res) => {
  try {
    const backups = await Backup.find().sort({ createdAt: -1 });
    res.json({ success: true, data: backups });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createBackup = async (req, res) => {
  try {
    const name = req.body.name || `Backup ${new Date().toISOString().split('T')[0]}`;

    const [
      pages, projects, skills, experiences, education,
      certificates, blogs, services, testimonials,
      messages, media, settings, theme,
    ] = await Promise.all([
      Page.find().lean(),
      Project.find().lean(),
      Skill.find().lean(),
      Experience.find().lean(),
      Education.find().lean(),
      Certificate.find().lean(),
      Blog.find().lean(),
      Service.find().lean(),
      Testimonial.find().lean(),
      Message.find().lean(),
      Media.find().lean(),
      Setting.find().lean(),
      Theme.find().lean(),
    ]);

    const data = {
      pages, projects, skills, experiences, education,
      certificates, blogs, services, testimonials,
      messages, media, settings, theme,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const dataStr = JSON.stringify(data);
    const sizeKB = Math.round(Buffer.byteLength(dataStr, 'utf8') / 1024);
    const size = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

    const backup = await Backup.create({
      name,
      size,
      type: 'manual',
      status: 'completed',
      data,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: backup });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreBackup = async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });

    const { data } = backup;
    if (!data) return res.status(400).json({ success: false, message: 'Backup data is empty' });

    if (data.pages) {
      await Page.deleteMany({});
      await Page.insertMany(data.pages);
    }
    if (data.projects) {
      await Project.deleteMany({});
      await Project.insertMany(data.projects);
    }
    if (data.skills) {
      await Skill.deleteMany({});
      await Skill.insertMany(data.skills);
    }
    if (data.experiences) {
      await Experience.deleteMany({});
      await Experience.insertMany(data.experiences);
    }
    if (data.education) {
      await Education.deleteMany({});
      await Education.insertMany(data.education);
    }
    if (data.certificates) {
      await Certificate.deleteMany({});
      await Certificate.insertMany(data.certificates);
    }
    if (data.blogs) {
      await Blog.deleteMany({});
      await Blog.insertMany(data.blogs);
    }
    if (data.services) {
      await Service.deleteMany({});
      await Service.insertMany(data.services);
    }
    if (data.testimonials) {
      await Testimonial.deleteMany({});
      await Testimonial.insertMany(data.testimonials);
    }
    if (data.messages) {
      await Message.deleteMany({});
      await Message.insertMany(data.messages);
    }
    if (data.media) {
      await Media.deleteMany({});
      await Media.insertMany(data.media);
    }
    if (data.settings) {
      await Setting.deleteMany({});
      await Setting.insertMany(data.settings);
    }
    if (data.theme) {
      await Theme.deleteMany({});
      await Theme.insertMany(data.theme);
    }

    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBackup = async (req, res) => {
  try {
    const backup = await Backup.findByIdAndDelete(req.params.id);
    if (!backup) return res.status(404).json({ success: false, message: 'Backup not found' });
    res.json({ success: true, message: 'Backup deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportData = async (req, res) => {
  try {
    const { type } = req.params;
    let data = {};

    const models = {
      pages: Page, projects: Project, skills: Skill, experiences: Experience,
      education: Education, certificates: Certificate, blogs: Blog,
      services: Service, testimonials: Testimonial, messages: Message,
      media: Media, settings: Setting, theme: Theme,
    };

    if (type === 'all') {
      for (const [key, Model] of Object.entries(models)) {
        data[key] = await Model.find().lean();
      }
    } else if (models[type]) {
      data[type] = await models[type].find().lean();
    } else {
      return res.status(400).json({ success: false, message: 'Invalid export type' });
    }

    data.exportedAt = new Date().toISOString();
    data.version = '1.0';

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=portfolio-${type}-${Date.now()}.json`);
    res.json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.importData = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a JSON file' });

    const data = JSON.parse(req.file.buffer.toString());
    let imported = 0;

    const modelMap = {
      pages: Page, projects: Project, skills: Skill, experiences: Experience,
      education: Education, certificates: Certificate, blogs: Blog,
      services: Service, testimonials: Testimonial, messages: Message,
      media: Media, settings: Setting, theme: Theme,
    };

    for (const [key, Model] of Object.entries(modelMap)) {
      if (data[key] && Array.isArray(data[key]) && data[key].length > 0) {
        await Model.deleteMany({});
        await Model.insertMany(data[key]);
        imported += data[key].length;
      }
    }

    res.json({ success: true, message: `Imported ${imported} records`, imported });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
