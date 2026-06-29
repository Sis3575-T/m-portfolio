const mongoose = require('mongoose');

const accessibilityIssueSchema = new mongoose.Schema({
  page: { type: String, required: true },
  type: {
    type: String,
    enum: ['missing_alt', 'poor_contrast', 'heading_structure', 'missing_label', 'other'],
    default: 'other',
  },
  element: { type: String, default: '' },
  impact: {
    type: String,
    enum: ['critical', 'serious', 'moderate', 'minor'],
    default: 'moderate',
  },
  description: { type: String, default: '' },
  recommendation: { type: String, default: '' },
  isFixed: { type: Boolean, default: false },
  detectedAt: { type: Date, default: Date.now },
  fixedAt: { type: Date },
}, { timestamps: true });

accessibilityIssueSchema.index({ page: 1, isFixed: 1 });
accessibilityIssueSchema.index({ impact: 1, isFixed: 1 });

module.exports = mongoose.model('AccessibilityIssue', accessibilityIssueSchema);
