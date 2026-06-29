const mongoose = require('mongoose');

const pageViewSchema = new mongoose.Schema({
  path: { type: String, default: '/' },
  title: { type: String, default: '' },
  entryTime: { type: Date, default: Date.now },
  exitTime: { type: Date },
  duration: { type: Number, default: 0 },
}, { _id: false });

const actionSchema = new mongoose.Schema({
  type: { type: String, default: '' },
  target: { type: String, default: '' },
  label: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { _id: false });

const visitorSchema = new mongoose.Schema({
  ip: { type: String, default: '' },
  sessionId: { type: String, default: '', index: true },
  country: { type: String, default: 'Unknown' },
  city: { type: String, default: 'Unknown' },
  region: { type: String, default: '' },
  timezone: { type: String, default: '' },
  device: { type: String, default: 'Desktop', enum: ['Desktop', 'Mobile', 'Tablet', 'Other'] },
  browser: { type: String, default: 'Chrome' },
  os: { type: String, default: 'Windows' },
  screenResolution: { type: String, default: '' },
  language: { type: String, default: '' },
  referrer: { type: String, default: 'Direct' },
  pages: [pageViewSchema],
  actions: [actionSchema],
  pageViews: { type: Number, default: 0 },
  sessionStart: { type: Date, default: Date.now },
  sessionEnd: { type: Date },
  sessionDuration: { type: Number, default: 0 },
  isOnline: { type: Boolean, default: false, index: true },
  lastActivity: { type: Date, default: Date.now, index: true },
  downloads: { type: Number, default: 0 },
  contactSubmissions: { type: Number, default: 0 },
}, { timestamps: true });

visitorSchema.index({ country: 1, city: 1 });
visitorSchema.index({ browser: 1 });
visitorSchema.index({ os: 1 });
visitorSchema.index({ device: 1 });
visitorSchema.index({ referrer: 1 });
visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ lastActivity: -1 });

module.exports = mongoose.model('Visitor', visitorSchema);
