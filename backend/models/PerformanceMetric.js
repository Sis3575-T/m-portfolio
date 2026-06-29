const mongoose = require('mongoose');

const performanceMetricSchema = new mongoose.Schema({
  page: { type: String, required: true },
  loadTime: { type: Number, default: 0 },
  lcp: { type: Number, default: 0 },
  fcp: { type: Number, default: 0 },
  cls: { type: Number, default: 0 },
  ttfb: { type: Number, default: 0 },
  domInteractive: { type: Number, default: 0 },
  imageSizes: { type: Number, default: 0 },
  device: { type: String, default: '' },
  browser: { type: String, default: '' },
  country: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

performanceMetricSchema.index({ page: 1, timestamp: -1 });
performanceMetricSchema.index({ timestamp: -1 });

module.exports = mongoose.model('PerformanceMetric', performanceMetricSchema);
