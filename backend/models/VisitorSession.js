const mongoose = require('mongoose');

const visitorSessionSchema = new mongoose.Schema({
  visitorId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, unique: true, index: true },

  startedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  duration: { type: Number, default: 0 },

  ipHash: { type: String },
  country: { type: String },
  countryCode: { type: String },
  region: { type: String },
  city: { type: String },
  postalCode: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  currency: { type: String },
  isp: { type: String },
  timezone: { type: String },
  language: { type: String },

  browser: { type: String },
  browserVersion: { type: String },
  os: { type: String },
  deviceType: { type: String, enum: ['desktop', 'tablet', 'mobile', 'unknown'], default: 'unknown' },
  screenResolution: { type: String },
  viewportSize: { type: String },

  referrer: { type: String },
  referrerDomain: { type: String },
  utmSource: { type: String },
  utmMedium: { type: String },
  utmCampaign: { type: String },

  landingPage: { type: String },
  exitPage: { type: String },
  pages: [{ url: String, title: String, enteredAt: Date, leftAt: Date, duration: Number, scrollDepth: Number }],

  pageViews: { type: Number, default: 0 },
  clicks: { type: Number, default: 0 },
  projectClicks: { type: Number, default: 0 },
  githubClicks: { type: Number, default: 0 },
  liveDemoClicks: { type: Number, default: 0 },
  resumeDownloads: { type: Number, default: 0 },
  contactSubmissions: { type: Number, default: 0 },

  maxScrollDepth: { type: Number, default: 0 },
  isReturning: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  visitCount: { type: Number, default: 1 },

  theme: { type: String },
  languageSelected: { type: String },

  createdAt: { type: Date, default: Date.now },
});

visitorSessionSchema.index({ createdAt: -1 });
visitorSessionSchema.index({ country: 1 });
visitorSessionSchema.index({ browser: 1 });
visitorSessionSchema.index({ deviceType: 1 });
visitorSessionSchema.index({ isActive: 1, lastActiveAt: -1 });
visitorSessionSchema.index({ visitorId: 1, createdAt: -1 });
visitorSessionSchema.index({ city: 1 });
visitorSessionSchema.index({ os: 1 });

module.exports = mongoose.model('VisitorSession', visitorSessionSchema);
