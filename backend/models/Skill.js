const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
  },
  icon: { type: String, default: '' },
  proficiency: { type: Number, min: 0, max: 100, default: 80 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

skillSchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('Skill', skillSchema);
