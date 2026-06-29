const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
  key: { type: String, required: true },
  language: { type: String, required: true },
  value: { type: String, required: true },
  namespace: { type: String, default: 'general' },
}, { timestamps: true });

translationSchema.index({ key: 1, language: 1 }, { unique: true });
translationSchema.index({ namespace: 1, language: 1 });

module.exports = mongoose.model('Translation', translationSchema);
