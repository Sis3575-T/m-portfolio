const Skill = require('../models/Skill');

exports.getSkills = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    const skills = await Skill.find(filter).sort({ category: 1, order: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, order: 1 });
    res.json({ success: true, data: skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createSkill = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.icon = req.file.path;
    const skill = await Skill.create(body);
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) body.icon = req.file.path;
    const skill = await Skill.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderSkills = async (req, res) => {
  try {
    const { items } = req.body;
    for (const item of items) {
      await Skill.findByIdAndUpdate(item._id, { order: item.order });
    }
    res.json({ success: true, message: 'Skills reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
