const Template = require('../models/Template');

exports.getTemplates = async (req, res) => {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.global === 'true') filter.isGlobal = true;
    const templates = await Template.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: templates });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTemplate = async (req, res) => {
  try {
    const template = await Template.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, message: 'Template deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.duplicateTemplate = async (req, res) => {
  try {
    const source = await Template.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Template not found' });
    const data = source.toObject();
    delete data._id;
    data.name = `${data.name} (Copy)`;
    const template = await Template.create(data);
    res.status(201).json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportTemplate = async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    res.json({ success: true, data: template });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.importTemplate = async (req, res) => {
  try {
    const template = await Template.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, data: template, message: 'Template imported successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
