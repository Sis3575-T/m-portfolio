const ActivityLog = require('../models/ActivityLog');

exports.getActivityLogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0, action, user } = req.query;
    const filter = {};
    if (action) filter.action = { $regex: action, $options: 'i' };
    if (user) filter.user = user;

    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .skip(parseInt(offset))
        .limit(parseInt(limit)),
      ActivityLog.countDocuments(filter),
    ]);

    res.json({ success: true, data: logs, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(20);
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearActivityLogs = async (req, res) => {
  try {
    await ActivityLog.deleteMany({});
    res.json({ success: true, message: 'Activity logs cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
