const Notification = require('../models/Notification');

exports.getNotifications = async (req, res) => {
  try {
    const filter = { $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }] };
    if (req.query.unread === 'true') filter.read = false;
    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ ...filter, read: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }] },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: 'Notification not found' });
    res.json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { read: false, $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }] },
      { read: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      $or: [{ user: req.user._id }, { user: { $exists: false } }, { user: null }],
    });
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createNotification = async (data) => {
  try {
    return await Notification.create(data);
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};
