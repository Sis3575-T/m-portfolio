const mongoose = require('mongoose');

const versionHistorySchema = new mongoose.Schema({
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
  version: { type: Number, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  changes: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

versionHistorySchema.index({ resource: 1, resourceId: 1, version: 1 }, { unique: true });
versionHistorySchema.index({ resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('VersionHistory', versionHistorySchema);
