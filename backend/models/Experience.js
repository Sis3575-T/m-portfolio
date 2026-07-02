const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  position: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  current: { type: Boolean, default: false },
  description: { type: String, default: '' },
  responsibilities: [{ type: String, trim: true }],
  achievements: [{ type: String, trim: true }],
  location: { type: String, default: '' },
  totalYears: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

experienceSchema.index({ order: 1 });

module.exports = mongoose.model('Experience', experienceSchema);
