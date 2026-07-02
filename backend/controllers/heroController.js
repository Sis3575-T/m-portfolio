const Hero = require('../models/Hero');

exports.getHero = async (req, res) => {
  try {
    const hero = await Hero.findOne({ isActive: true }).sort({ createdAt: -1 });
    if (!hero) return res.json({ success: true, data: null });
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHeroById = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createHero = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.avatar = '/uploads/' + req.file.filename;
    }
    if (typeof body.socialLinks === 'string') {
      try { body.socialLinks = JSON.parse(body.socialLinks); } catch {}
    }
    if (typeof body.buttons === 'string') {
      try { body.buttons = JSON.parse(body.buttons); } catch {}
    }
    if (typeof body.highlights === 'string') {
      try { body.highlights = JSON.parse(body.highlights); } catch {}
    }
    const hero = await Hero.create(body);
    res.status(201).json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateHero = async (req, res) => {
  try {
    const body = { ...req.body };
    if (req.file) {
      body.avatar = '/uploads/' + req.file.filename;
    }
    if (typeof body.socialLinks === 'string') {
      try { body.socialLinks = JSON.parse(body.socialLinks); } catch {}
    }
    if (typeof body.buttons === 'string') {
      try { body.buttons = JSON.parse(body.buttons); } catch {}
    }
    if (typeof body.highlights === 'string') {
      try { body.highlights = JSON.parse(body.highlights); } catch {}
    }
    const filter = req.params.id ? { _id: req.params.id } : { isActive: true };
    const hero = await Hero.findOneAndUpdate(filter, body, { new: true, runValidators: true, upsert: true });
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteHero = async (req, res) => {
  try {
    const hero = await Hero.findByIdAndDelete(req.params.id);
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    res.json({ success: true, message: 'Hero deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleHero = async (req, res) => {
  try {
    const hero = await Hero.findById(req.params.id);
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    hero.isActive = !hero.isActive;
    await hero.save();
    res.json({ success: true, data: hero });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
