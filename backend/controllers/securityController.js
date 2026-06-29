const LoginHistory = require('../models/LoginHistory');

exports.getLoginHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, email, startDate, endDate } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (email) filter.email = { $regex: email, $options: 'i' };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const [total, logs] = await Promise.all([
      LoginHistory.countDocuments(filter),
      LoginHistory.find(filter)
        .populate('user', 'name email')
        .sort({ timestamp: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFailedAttempts = async (req, res) => {
  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await LoginHistory.countDocuments({ status: 'failed', timestamp: { $gte: since } });
    res.json({ success: true, data: { count, since } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLoginStats = async (req, res) => {
  try {
    const [totalLogins, failedLogins, uniqueIPsResult, mostActiveIPs] = await Promise.all([
      LoginHistory.countDocuments(),
      LoginHistory.countDocuments({ status: 'failed' }),
      LoginHistory.distinct('ip'),
      LoginHistory.aggregate([
        { $group: { _id: '$ip', count: { $sum: 1 }, lastAttempt: { $max: '$timestamp' } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        totalLogins,
        failedLogins,
        uniqueIPs: uniqueIPsResult.length,
        mostActiveIPs: mostActiveIPs.map((ip) => ({
          ip: ip._id,
          count: ip.count,
          lastAttempt: ip.lastAttempt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.clearLoginHistory = async (req, res) => {
  try {
    const { before } = req.query;
    const filter = {};
    if (before) filter.timestamp = { $lte: new Date(before) };

    const result = await LoginHistory.deleteMany(filter);
    res.json({ success: true, message: `Deleted ${result.deletedCount} login records` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
