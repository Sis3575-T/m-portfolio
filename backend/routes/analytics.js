const router = require('express').Router();
const {
  getDashboardStats, getVisitorStats, getVisitorLocations,
  getDeviceStats, getBrowserStats, getOSStats, getPageStats,
  getReferrerStats, getSessionStats, getActiveVisitors, getLiveFeed,
  getVisitorDetails, getProjectAnalytics, getResumeAnalytics,
  getContactAnalytics, getAnalyticsOverview,
  trackVisit, trackAction, endSession, getExportData,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');
const VisitorSession = require('../models/VisitorSession');
const VisitorEvent = require('../models/VisitorEvent');

// Public tracking endpoints (no auth required)
router.post('/track/visit', trackVisit);
router.post('/track/action', trackAction);
router.post('/track/end-session', endSession);

// Admin protected endpoints
router.get('/dashboard', protect, getDashboardStats);
router.get('/visitors', protect, getVisitorStats);
router.get('/locations', protect, getVisitorLocations);
router.get('/devices', protect, getDeviceStats);
router.get('/browsers', protect, getBrowserStats);
router.get('/os', protect, getOSStats);
router.get('/pages', protect, getPageStats);
router.get('/referrers', protect, getReferrerStats);
router.get('/sessions', protect, getSessionStats);
router.get('/active', protect, getActiveVisitors);
router.get('/live-feed', protect, getLiveFeed);
router.get('/visitor-details', protect, getVisitorDetails);
router.get('/projects', protect, getProjectAnalytics);
router.get('/resume', protect, getResumeAnalytics);
router.get('/contact', protect, getContactAnalytics);
router.get('/overview', protect, getAnalyticsOverview);
router.get('/export', protect, getExportData);

// New analytics endpoints using VisitorSession + VisitorEvent
router.get('/live', protect, async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 300000);
    const active = await VisitorSession.find(
      { isActive: true, lastActiveAt: { $gte: fiveMinAgo } },
      'visitorId sessionId country city browser deviceType os pages lastActiveAt startedAt landingPage exitPage viewportSize screenResolution referrer'
    ).sort({ lastActiveAt: -1 }).limit(50).lean();

    res.json({
      success: true,
      data: active.map(v => ({
        _id: v._id,
        visitorId: v.visitorId,
        sessionId: v.sessionId,
        country: v.country || '',
        city: v.city || '',
        browser: v.browser || '',
        deviceType: v.deviceType || '',
        os: v.os || '',
        currentPage: v.pages?.length > 0 ? v.pages[v.pages.length - 1].url : (v.exitPage || v.landingPage || '/'),
        duration: v.startedAt ? Math.round((Date.now() - new Date(v.startedAt)) / 1000) : 0,
        lastActiveAt: v.lastActiveAt,
        referrer: v.referrer || '',
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/visitors-list', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', country, deviceType, browser } = req.query;
    const filter = {};
    if (country) filter.country = country;
    if (deviceType) filter.deviceType = deviceType;
    if (browser) filter.browser = browser;
    if (search) {
      filter.$or = [
        { country: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { browser: { $regex: search, $options: 'i' } },
        { os: { $regex: search, $options: 'i' } },
        { referrer: { $regex: search, $options: 'i' } },
        { visitorId: { $regex: search, $options: 'i' } },
      ];
    }
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [total, visitors] = await Promise.all([
      VisitorSession.countDocuments(filter),
      VisitorSession.find(filter)
        .sort(sortObj)
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        visitors: visitors.map(v => ({
          _id: v._id,
          visitorId: v.visitorId,
          sessionId: v.sessionId,
          country: v.country || '—',
          city: v.city || '',
          browser: v.browser || '—',
          os: v.os || '—',
          deviceType: v.deviceType || '—',
          pageViews: v.pageViews || 0,
          duration: v.duration || 0,
          landingPage: v.landingPage || '/',
          exitPage: v.exitPage || '',
          referrer: v.referrer || 'Direct',
          isActive: v.isActive,
          lastActiveAt: v.lastActiveAt,
          createdAt: v.createdAt,
        })),
        total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/visitors/:id', protect, async (req, res) => {
  try {
    const session = await VisitorSession.findById(req.params.id).lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const events = await VisitorEvent.find({ sessionId: session.sessionId })
      .sort({ timestamp: 1 })
      .limit(500)
      .lean();

    res.json({
      success: true,
      data: {
        ...session,
        events,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/visitors/:id', protect, async (req, res) => {
  try {
    const session = await VisitorSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    await Promise.all([
      VisitorEvent.deleteMany({ sessionId: session.sessionId }),
      VisitorSession.findByIdAndDelete(req.params.id),
    ]);
    res.json({ success: true, message: 'Visitor deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/visitors/:id/events', protect, async (req, res) => {
  try {
    const session = await VisitorSession.findById(req.params.id).select('sessionId').lean();
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const events = await VisitorEvent.find({ sessionId: session.sessionId })
      .sort({ timestamp: -1 })
      .limit(200)
      .lean();

    res.json({ success: true, data: events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/countries', protect, async (req, res) => {
  try {
    const countries = await VisitorSession.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 }, unique: { $addToSet: '$visitorId' }, sessions: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    const total = countries.reduce((s, c) => s + c.count, 0);
    res.json({
      success: true,
      data: countries.map(c => ({
        country: c._id || 'Unknown',
        count: c.count,
        unique: c.unique.length,
        sessions: c.sessions,
        percentage: total > 0 ? Math.round((c.count / total) * 1000) / 10 : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/browsers-stats', protect, async (req, res) => {
  try {
    const browsers = await VisitorSession.aggregate([
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = browsers.reduce((s, b) => s + b.count, 0);
    res.json({
      success: true,
      data: browsers.map(b => ({
        name: b._id || 'Unknown',
        value: b.count,
        percentage: total > 0 ? Math.round((b.count / total) * 100) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/devices-stats', protect, async (req, res) => {
  try {
    const devices = await VisitorSession.aggregate([
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = devices.reduce((s, d) => s + d.count, 0);
    res.json({
      success: true,
      data: devices.map(d => ({
        name: d._id || 'Unknown',
        value: d.count,
        percentage: total > 0 ? Math.round((d.count / total) * 100) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/os-stats', protect, async (req, res) => {
  try {
    const os = await VisitorSession.aggregate([
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = os.reduce((s, o) => s + o.count, 0);
    res.json({
      success: true,
      data: os.map(o => ({
        name: o._id || 'Unknown',
        value: o.count,
        percentage: total > 0 ? Math.round((o.count / total) * 100) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/sources', protect, async (req, res) => {
  try {
    const sources = await VisitorSession.aggregate([
      { $group: { _id: { $ifNull: ['$referrerDomain', { $ifNull: ['$referrer', 'Direct'] }] }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);
    const total = sources.reduce((s, src) => s + src.count, 0);

    const categoryMap = {};
    sources.forEach(src => {
      const domain = src._id || 'Direct';
      let category = 'Direct';
      if (domain && domain !== 'Direct') {
        if (domain.includes('google')) category = 'Organic Search';
        else if (domain.includes('facebook') || domain.includes('twitter') || domain.includes('linkedin') || domain.includes('instagram')) category = 'Social Media';
        else if (domain.includes('github')) category = 'GitHub';
        else category = 'Referral';
      }
      categoryMap[category] = (categoryMap[category] || 0) + src.count;
    });

    res.json({
      success: true,
      data: Object.entries(categoryMap).map(([name, count]) => ({
        source: name,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/pages-stats', protect, async (req, res) => {
  try {
    const pages = await VisitorSession.aggregate([
      { $unwind: '$pages' },
      { $group: { _id: '$pages.url', views: { $sum: 1 }, unique: { $addToSet: '$visitorId' }, totalDuration: { $sum: { $ifNull: ['$pages.duration', 0] } } } },
      { $sort: { views: -1 } },
      { $limit: 50 },
    ]);

    res.json({
      success: true,
      data: pages.map(p => ({
        path: p._id || '/',
        views: p.views,
        unique: p.unique.length,
        avgTime: p.views > 0 ? Math.round(p.totalDuration / p.views) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/events-stats', protect, async (req, res) => {
  try {
    const events = await VisitorEvent.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = events.reduce((s, e) => s + e.count, 0);
    res.json({
      success: true,
      data: events.map(e => ({
        eventType: e._id,
        count: e.count,
        percentage: total > 0 ? Math.round((e.count / total) * 100) : 0,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/bounce-rate', protect, async (req, res) => {
  try {
    const df = {};
    const range = req.query.range || '30d';
    const now = new Date();
    if (range === 'today') df.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (range === '7d') df.$gte = new Date(now.getTime() - 7 * 86400000);
    else if (range === '30d') df.$gte = new Date(now.getTime() - 30 * 86400000);
    else if (range === '90d') df.$gte = new Date(now.getTime() - 90 * 86400000);

    const match = Object.keys(df).length > 0 ? { createdAt: df } : {};
    const [total, bounces] = await Promise.all([
      VisitorSession.countDocuments(match),
      VisitorSession.countDocuments({ ...match, pageViews: { $lte: 1 } }),
    ]);

    res.json({
      success: true,
      data: {
        rate: total > 0 ? Math.round((bounces / total) * 100) : 0,
        totalSessions: total,
        bouncedSessions: bounces,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/duration', protect, async (req, res) => {
  try {
    const df = {};
    const range = req.query.range || '30d';
    const now = new Date();
    if (range === 'today') df.$gte = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (range === '7d') df.$gte = new Date(now.getTime() - 7 * 86400000);
    else if (range === '30d') df.$gte = new Date(now.getTime() - 30 * 86400000);
    else if (range === '90d') df.$gte = new Date(now.getTime() - 90 * 86400000);

    const match = Object.keys(df).length > 0 ? { createdAt: df } : {};
    const sessions = await VisitorSession.find(match).select('duration createdAt').lean();
    const withDuration = sessions.filter(s => s.duration > 0);
    const avgDuration = withDuration.length > 0
      ? Math.round(withDuration.reduce((s, sess) => s + sess.duration, 0) / withDuration.length)
      : 0;

    res.json({
      success: true,
      data: {
        average: avgDuration,
        total: sessions.length,
        withDuration: withDuration.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/report', protect, async (req, res) => {
  try {
    const { startDate, endDate, format = 'json' } = req.query;
    const filter = {};
    if (startDate) filter.createdAt = { $gte: new Date(startDate) };
    if (endDate) filter.createdAt = { ...filter.createdAt, $lte: new Date(endDate) };

    const sessions = await VisitorSession.find(filter).sort({ createdAt: -1 }).lean();
    const events = await VisitorEvent.find(filter).sort({ timestamp: -1 }).limit(1000).lean();

    if (format === 'csv') {
      const headers = 'SessionID,VisitorID,Country,Browser,OS,DeviceType,PageViews,Duration,Referrer,LandingPage,Date';
      const rows = sessions.map(v =>
        `"${v.sessionId}","${v.visitorId}","${v.country || ''}","${v.browser || ''}","${v.os || ''}","${v.deviceType || ''}",${v.pageViews || 0},${v.duration || 0},"${v.referrer || ''}","${v.landingPage || ''}","${v.createdAt ? new Date(v.createdAt).toISOString() : ''}"`
      );
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=analytics-report.csv');
      return res.send([headers, ...rows].join('\n'));
    }

    res.json({
      success: true,
      data: {
        sessions,
        events,
        summary: {
          totalSessions: sessions.length,
          totalEvents: events.length,
          generatedAt: new Date().toISOString(),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── Enhanced Analytics Endpoints ──

router.get('/daily-visits', protect, async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const now = new Date();
    let startDate;
    if (range === 'today') startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    else if (range === '7d') startDate = new Date(now.getTime() - 7 * 86400000);
    else if (range === '90d') startDate = new Date(now.getTime() - 90 * 86400000);
    else startDate = new Date(now.getTime() - 30 * 86400000);

    const visits = await VisitorSession.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, visits: { $sum: 1 }, unique: { $addToSet: '$visitorId' }, pageViews: { $sum: '$pageViews' } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: visits.map(v => ({
        date: v._id,
        visits: v.visits,
        unique: v.unique.length,
        pageViews: v.pageViews,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/weekly-monthly', protect, async (req, res) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getTime() - 180 * 86400000);

    const weekly = await VisitorSession.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { week: { $isoWeek: '$createdAt' }, year: { $isoWeekYear: '$createdAt' } }, visits: { $sum: 1 }, unique: { $addToSet: '$visitorId' } } },
      { $sort: { '_id.year': 1, '_id.week': 1 } },
    ]);

    const monthly = await VisitorSession.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, visits: { $sum: 1 }, unique: { $addToSet: '$visitorId' } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        weekly: weekly.map(w => ({
          label: `${w._id.year}-W${w._id.week}`,
          visits: w.visits,
          unique: w.unique.length,
        })),
        monthly: monthly.map(m => ({
          label: m._id,
          visits: m.visits,
          unique: m.unique.length,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/returning-stats', protect, async (req, res) => {
  try {
    const [newVisitors, returningVisitors] = await Promise.all([
      VisitorSession.countDocuments({ isReturning: false }),
      VisitorSession.countDocuments({ isReturning: true }),
    ]);
    const total = newVisitors + returningVisitors;

    res.json({
      success: true,
      data: {
        new: newVisitors,
        returning: returningVisitors,
        newPercent: total > 0 ? Math.round((newVisitors / total) * 100) : 0,
        returningPercent: total > 0 ? Math.round((returningVisitors / total) * 100) : 0,
        total,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/cities', protect, async (req, res) => {
  try {
    const cities = await VisitorSession.aggregate([
      { $match: { city: { $ne: '', $exists: true } } },
      { $group: { _id: { city: '$city', country: '$country', countryCode: '$countryCode' }, count: { $sum: 1 }, unique: { $addToSet: '$visitorId' } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    res.json({
      success: true,
      data: cities.map(c => ({
        city: c._id.city,
        country: c._id.country,
        countryCode: c._id.countryCode,
        count: c.count,
        unique: c.unique.length,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
