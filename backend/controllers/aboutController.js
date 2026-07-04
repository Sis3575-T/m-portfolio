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
    const body = { ...req.body };
    if (typeof body.keyAchievements === 'string') body.keyAchievements = JSON.parse(body.keyAchievements);
    if (typeof body.stats === 'string') body.stats = JSON.parse(body.stats);
    if (body.description) { body.biography = body.description; delete body.description; }
    if (body.keyPoints) { body.keyAchievements = body.keyPoints; delete body.keyPoints; }
    delete body.title;
    delete body.image;
    delete body.imageFile;
    delete body._id;
    delete body.__v;
    const filter = req.params.id ? { _id: req.params.id } : body._id ? { _id: body._id } : { isActive: true };
    const about = await About.findOneAndUpdate(filter, body, { new: true, runValidators: true });
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
