const Theme = require('../models/Theme');

exports.getTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne();
    if (!theme) {
      theme = await Theme.create({});
    }
    res.json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTheme = async (req, res) => {
  try {
    let theme = await Theme.findOne();
    if (!theme) {
      theme = await Theme.create(req.body);
    } else {
      Object.assign(theme, req.body);
      await theme.save();
    }
    res.json({ success: true, data: theme });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.resetTheme = async (req, res) => {
  try {
    await Theme.deleteMany({});
    const theme = await Theme.create({});
    res.json({ success: true, data: theme, message: 'Theme reset to defaults' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
