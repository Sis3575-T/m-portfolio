const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permissions: [{ type: String }],
  active: { type: Boolean, default: true },
  lastUsed: { type: Date },
  expiresAt: { type: Date },
}, { timestamps: true });

apiKeySchema.index({ user: 1 });

apiKeySchema.statics.generateKey = function () {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
