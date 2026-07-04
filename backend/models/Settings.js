const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  name: { type: String, default: 'Sisay Temesgen' },
  siteTitle: { type: String, default: 'Sisay Temesgen — Portfolio' },
  siteDescription: { type: String, default: 'Full Stack Developer & AI Enthusiast' },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  footerText: { type: String, default: 'Built with React & Node.js' },
  copyrightText: { type: String, default: '© 2026 Sisay Temesgen. All rights reserved.' },
  email: { type: String, default: 'sisay3575@gmail.com' },
  phone: { type: String, default: '+251 935 756 054' },
  address: { type: String, default: 'Bahir Dar, Ethiopia' },

  city: { type: String, default: '' },
  country: { type: String, default: '' },
  nationality: { type: String, default: '' },
  dateOfBirth: { type: String, default: '' },
  professionalTitle: { type: String, default: '' },
  shortBio: { type: String, default: '' },
  longBio: { type: String, default: '' },
  currentCompany: { type: String, default: '' },
  currentPosition: { type: String, default: '' },
  yearsOfExperience: { type: String, default: '' },
  freelanceAvailable: { type: Boolean, default: false },
  languages: { type: String, default: '' },
  profilePhoto: { type: String, default: '' },
  coverPhoto: { type: String, default: '' },

  github: { type: String, default: 'https://github.com/Sis3575-T' },
  linkedin: { type: String, default: '' },
  twitter: { type: String, default: '' },
  telegram: { type: String, default: '' },
  facebook: { type: String, default: '' },
  instagram: { type: String, default: '' },
  youtube: { type: String, default: '' },
  medium: { type: String, default: '' },
  stackoverflow: { type: String, default: '' },
  leetcode: { type: String, default: '' },

  maintenanceMode: { type: Boolean, default: false },

  pageStyles: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
