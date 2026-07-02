const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  thumbnail: { type: String, default: '' },
  images: [{ type: String }],
  technologies: [{ type: String, trim: true }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  projectUrl: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  category: { type: String, default: 'Full Stack' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  isVisible: { type: Boolean, default: true },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
  statusBadge: { type: String, enum: ['Completed', 'In Progress', 'Featured', 'Open Source'], default: 'Completed' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
  // Button customization
  liveLabel: { type: String, default: 'Live Demo' },
  githubLabel: { type: String, default: 'GitHub' },
  detailsLabel: { type: String, default: 'Details' },
  // Card styling
  cardBorderRadius: { type: Number, default: 16 },
  overlayOpacity: { type: Number, default: 0.6, min: 0, max: 1 },
  objectPosition: { type: String, default: 'center' },
  // Hover animation
  hoverScale: { type: Number, default: 1.05 },
  hoverShadow: { type: Boolean, default: true },
  // Content display
  showStatusBadge: { type: Boolean, default: true },
  showTechStack: { type: Boolean, default: true },
  maxTechDisplay: { type: Number, default: 6 },
  descriptionLines: { type: Number, default: 3 },
}, { timestamps: true });

projectSchema.index({ featured: -1, order: 1 });
projectSchema.index({ title: 'text', description: 'text', technologies: 'text' });

module.exports = mongoose.model('Project', projectSchema);
