const mongoose = require('mongoose');

const blockedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String, default: '' },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  blockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
}, { timestamps: true });

blockedIPSchema.index({ active: 1 });

module.exports = mongoose.model('BlockedIP', blockedIPSchema);
