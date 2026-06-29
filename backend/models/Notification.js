const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_visitor', 'new_message', 'cv_download', 'blog_comment', 'project_inquiry', 'system'],
    default: 'system',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String, default: '' },
  isRead: { type: Boolean, default: false },
  relatedTo: {
    model: { type: String, default: '' },
    id: { type: mongoose.Schema.Types.ObjectId },
  },
}, { timestamps: true });

notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
