const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createActivityLog = async (action, resource, resourceId, description, userId, ip, userAgent) => {
  try {
    await ActivityLog.create({ action, resource, resourceId, description, user: userId, ip, userAgent });
  } catch (error) {
    console.error('Failed to create activity log:', error.message);
  }
};
