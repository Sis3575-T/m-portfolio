const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: String, default: '0 KB' },
  type: { type: String, enum: ['manual', 'automatic'], default: 'manual' },
  status: { type: String, enum: ['completed', 'failed', 'in_progress'], default: 'completed' },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Backup', backupSchema);
