const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  type: { type: String, enum: ['section', 'component', 'page'], default: 'section' },
  thumbnail: { type: String },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  tags: [{ type: String }],
  isGlobal: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
