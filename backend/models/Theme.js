const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: { type: String, default: 'Default Theme' },
  isActive: { type: Boolean, default: true },
  colors: {
    primary: { type: String, default: '#2563EB' },
    secondary: { type: String, default: '#7C3AED' },
    background: { type: String, default: '#F8FAFC' },
    surface: { type: String, default: '#FFFFFF' },
    card: { type: String, default: '#FFFFFF' },
    border: { type: String, default: '#E5E7EB' },
    text: { type: String, default: '#111827' },
    heading: { type: String, default: '#111827' },
    link: { type: String, default: '#2563EB' },
    success: { type: String, default: '#16A34A' },
    warning: { type: String, default: '#F59E0B' },
    danger: { type: String, default: '#EF4444' },
  },
  typography: {
    fontFamily: { type: String, default: 'Inter, sans-serif' },
    headingFont: { type: String, default: 'Inter, sans-serif' },
    monoFont: { type: String, default: 'JetBrains Mono, monospace' },
    baseSize: { type: Number, default: 16 },
    scale: { type: String, default: '1.25' },
    lineHeight: { type: Number, default: 1.6 },
  },
  layout: {
    containerWidth: { type: Number, default: 1200 },
    gridGap: { type: Number, default: 24 },
    borderRadius: { type: Number, default: 8 },
    spacing: { type: Number, default: 16 },
  },
  shadows: {
    sm: { type: String, default: '0 1px 2px rgba(0,0,0,0.04)' },
    md: { type: String, default: '0 4px 6px rgba(0,0,0,0.07)' },
    lg: { type: String, default: '0 10px 15px rgba(0,0,0,0.08)' },
    xl: { type: String, default: '0 20px 25px rgba(0,0,0,0.1)' },
  },
  darkMode: {
    enabled: { type: Boolean, default: false },
    background: { type: String, default: '#0F172A' },
    surface: { type: String, default: '#1E293B' },
    card: { type: String, default: '#1E293B' },
    border: { type: String, default: '#334155' },
    text: { type: String, default: '#F1F5F9' },
    heading: { type: String, default: '#F8FAFC' },
  },
  customCSS: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Theme', themeSchema);
