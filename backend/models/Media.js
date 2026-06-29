const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  originalName: { type: String, required: true },
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  category: {
    type: String,
    enum: ['image', 'document', 'resume', 'certificate', 'other'],
    default: 'image',
  },
  folder: { type: String, default: '' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

mediaSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Media', mediaSchema);
