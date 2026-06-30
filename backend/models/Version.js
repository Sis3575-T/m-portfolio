const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  resource: { type: String, required: true },
  resourceId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  diff: { type: mongoose.Schema.Types.Mixed },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
}, { timestamps: true });

versionSchema.index({ resource: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('Version', versionSchema);
