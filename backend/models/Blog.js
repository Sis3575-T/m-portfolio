const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String, required: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  category: { type: String, required: true },
  tags: [{ type: String, trim: true }],
  readingTime: { type: Number, default: 5 },
  featured: { type: Boolean, default: false },
  publishedAt: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  scheduledAt: { type: Date, default: null },
}, { timestamps: true });

blogSchema.index({ featured: -1, publishedAt: -1 });
blogSchema.index({ title: 'text', excerpt: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Blog', blogSchema);
