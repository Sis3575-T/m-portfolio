const Theme = require('../models/Theme');
const ActivityLog = require('../models/ActivityLog');

exports.getThemes = async (req, res) => {
  try {
    const themes = await Theme.find().sort({ createdAt: -1 });
    res.json({ success: true, data: themes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveTheme = async (req, res) => {
  try {
    const theme = await Theme.findOne({ isActive: true });
    res.json({ success: true, data: theme || {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTheme = async (req, res) => {
  try {
    const theme = await Theme.create(req.body);
    await ActivityLog.create({ user: req.user._id, action: 'theme.created', resource: 'Theme', resourceId: theme._id, details: { name: theme.name } });
    res.status(201).json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    const theme = await Theme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });
    await ActivityLog.create({ user: req.user._id, action: 'theme.updated', resource: 'Theme', resourceId: theme._id });
    res.json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.activateTheme = async (req, res) => {
  try {
    await Theme.updateMany({}, { isActive: false });
    const theme = await Theme.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
    if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });
    await ActivityLog.create({ user: req.user._id, action: 'theme.activated', resource: 'Theme', resourceId: theme._id, details: { name: theme.name } });
    res.json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTheme = async (req, res) => {
  try {
    const theme = await Theme.findByIdAndDelete(req.params.id);
    if (!theme) return res.status(404).json({ success: false, message: 'Theme not found' });
    await ActivityLog.create({ user: req.user._id, action: 'theme.deleted', resource: 'Theme', resourceId: req.params.id });
    res.json({ success: true, message: 'Theme deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.duplicateTheme = async (req, res) => {
  try {
    const source = await Theme.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Theme not found' });
    const data = source.toObject();
    delete data._id;
    delete data.createdAt;
    delete data.updatedAt;
    data.name = `${data.name} (Copy)`;
    data.isActive = false;
    const theme = await Theme.create(data);
    res.status(201).json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
