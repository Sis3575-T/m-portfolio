const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, default: '' },
  category: { type: String, default: 'Full Stack' },
  technologies: [{ type: String }],
  highlights: [{ type: String }],
  images: [{ type: String }],
  githubUrl: { type: String, default: '' },
  liveUrl: { type: String, default: '' },
  projectUrl: { type: String, default: '' },
  status: { type: String, enum: ['Live', 'In Progress', 'Completed'], default: 'Live' },
  statusBadge: { type: String, default: 'Completed' },
  featured: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  objectPosition: { type: String, default: 'center' },
  liveLabel: { type: String, default: 'Live Demo' },
  githubLabel: { type: String, default: 'GitHub' },
  detailsLabel: { type: String, default: 'Details' },
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
