const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = await Settings.create({});
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings();
    const body = { ...req.body };
    if (body.contactEmail) { body.email = body.contactEmail; delete body.contactEmail; }
    if (body.contactPhone) { body.phone = body.contactPhone; delete body.contactPhone; }
    Object.assign(settings, body);
    if (req.files) {
      if (req.files.logo) settings.logo = '/uploads/' + req.files.logo[0].filename;
      if (req.files.favicon) settings.favicon = '/uploads/' + req.files.favicon[0].filename;
      if (req.files.cv) settings.cvUrl = '/uploads/' + req.files.cv[0].filename;
    }
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };
