const Translation = require('../models/Translation');

exports.getTranslations = async (req, res) => {
  try {
    const { language, namespace, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (language) filter.language = language;
    if (namespace) filter.namespace = namespace;

    const [total, translations] = await Promise.all([
      Translation.countDocuments(filter),
      Translation.find(filter)
        .sort({ key: 1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: translations,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getTranslationByKey = async (req, res) => {
  try {
    const { language } = req.query;
    const filter = { key: req.params.key };
    if (language) filter.language = language;

    const translations = await Translation.find(filter).sort({ language: 1 }).lean();
    if (!translations.length) return res.status(404).json({ success: false, message: 'Translation not found' });

    res.json({ success: true, data: translations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createTranslation = async (req, res) => {
  try {
    const { key, language, value, namespace } = req.body;
    if (!key || !language || !value) {
      return res.status(400).json({ success: false, message: 'key, language, and value are required' });
    }

    const existing = await Translation.findOne({ key, language });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Translation already exists for this key and language' });
    }

    const translation = await Translation.create({ key, language, value, namespace });
    res.status(201).json({ success: true, data: translation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTranslation = async (req, res) => {
  try {
    const translation = await Translation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!translation) return res.status(404).json({ success: false, message: 'Translation not found' });
    res.json({ success: true, data: translation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTranslation = async (req, res) => {
  try {
    const translation = await Translation.findByIdAndDelete(req.params.id);
    if (!translation) return res.status(404).json({ success: false, message: 'Translation not found' });
    res.json({ success: true, message: 'Translation deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLanguages = async (req, res) => {
  try {
    const languages = await Translation.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: languages.map((l) => ({ language: l._id, count: l.count })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getByNamespace = async (req, res) => {
  try {
    const translations = await Translation.find({ namespace: req.params.ns }).sort({ key: 1 }).lean();
    res.json({ success: true, data: translations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.importTranslations = async (req, res) => {
  try {
    const { translations } = req.body;
    if (!translations || !Array.isArray(translations) || !translations.length) {
      return res.status(400).json({ success: false, message: 'translations array is required' });
    }

    let imported = 0;
    for (const t of translations) {
      if (!t.key || !t.language || !t.value) continue;
      await Translation.findOneAndUpdate(
        { key: t.key, language: t.language },
        { $set: { value: t.value, namespace: t.namespace || 'general' } },
        { upsert: true }
      );
      imported++;
    }

    res.json({ success: true, message: `Imported ${imported} translations`, imported });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
