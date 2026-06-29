const mongoose = require('mongoose');

const loginHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, default: '' },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  status: {
    type: String,
    enum: ['success', 'failed'],
    required: true,
  },
  failReason: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, { timestamps: true });

loginHistorySchema.index({ user: 1, timestamp: -1 });
loginHistorySchema.index({ email: 1, timestamp: -1 });
loginHistorySchema.index({ status: 1, timestamp: -1 });

module.exports = mongoose.model('LoginHistory', loginHistorySchema);
