const About = require('../models/About');

exports.getAbout = async (req, res) => {
  try {
    const about = await About.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!about) return res.json({ success: true, data: null });
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAboutById = async (req, res) => {
  try {
    const about = await About.findById(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: 'About not found' });
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAbout = async (req, res) => {
  try {
    const about = await About.create(req.body);
    res.status(201).json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateAbout = async (req, res) => {
  try {
    const filter = req.params.id ? { _id: req.params.id } : { isActive: true };
    const about = await About.findOneAndUpdate(filter, req.body, { new: true, runValidators: true, upsert: true });
    if (!about) return res.status(404).json({ success: false, message: 'About not found' });
    res.json({ success: true, data: about });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAbout = async (req, res) => {
  try {
    const about = await About.findByIdAndDelete(req.params.id);
    if (!about) return res.status(404).json({ success: false, message: 'About not found' });
    res.json({ success: true, message: 'About deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
