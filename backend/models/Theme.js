const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#1E293B' },
  secondaryColor: { type: String, default: '#334155' },
  accentColor: { type: String, default: '#0F766E' },
  backgroundColor: { type: String, default: '#F8FAFC' },
  cardColor: { type: String, default: '#FFFFFF' },
  textColor: { type: String, default: '#0F172A' },
  borderColor: { type: String, default: '#E2E8F0' },
  fontFamily: { type: String, default: 'Inter' },
  headingFont: { type: String, default: 'Inter' },
  buttonStyle: { type: String, enum: ['rounded', 'flat', 'pill'], default: 'rounded' },
  cardStyle: { type: String, enum: ['bordered', 'shadow', 'flat'], default: 'bordered' },
  headerStyle: { type: String, enum: ['fixed', 'static', 'sticky'], default: 'sticky' },
  footerStyle: { type: String, enum: ['dark', 'light', 'accent'], default: 'dark' },
  borderRadius: { type: String, default: '8' },
  shadowIntensity: { type: String, default: 'medium' },
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);
