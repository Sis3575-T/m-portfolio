const Visitor = require('../models/Visitor');
const Message = require('../models/Message');
const Project = require('../models/Project');

function dateFilter(range) {
  const now = new Date();
  let start = new Date(now.getTime() - 30 * 86400000);
  if (range === 'today') start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  else if (range === 'yesterday') start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  else if (range === '7d') start = new Date(now.getTime() - 7 * 86400000);
  else if (range === '30d') start = new Date(now.getTime() - 30 * 86400000);
  else if (range === '90d') start = new Date(now.getTime() - 90 * 86400000);
  else if (range === '1y') start = new Date(now.getTime() - 365 * 86400000);
  return { $gte: start };
}

exports.getDashboardStats = async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const df = dateFilter(range);
    const todayStart = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const weekStart = new Date(todayStart.getTime() - 6 * 86400000);

    const [
      totalVisitors, uniqueSessions, todayVisitors, weeklyVisitors, monthlyVisitors,
      onlineNow, messages, projects,
    ] = await Promise.all([
      Visitor.countDocuments().catch(() => 0),
      Visitor.distinct('sessionId').catch(() => []),
      Visitor.countDocuments({ createdAt: { $gte: todayStart } }).catch(() => 0),
      Visitor.countDocuments({ createdAt: { $gte: weekStart } }).catch(() => 0),
      Visitor.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }).catch(() => 0),
      Visitor.countDocuments({ lastActivity: { $gte: new Date(Date.now() - 300000) } }).catch(() => 0),
      Message.countDocuments().catch(() => 0),
      Project.countDocuments({ isActive: true }).catch(() => 0),
    ]);

    const returningVisitors = Math.max(0, totalVisitors - (uniqueSessions.length || 0));
    const bounceRate = totalVisitors > 0 ? Math.round((returningVisitors / totalVisitors) * 100) : 0;

    res.json({
      success: true,
      data: {
        totalVisitors, onlineNow, todayVisitors, weeklyVisitors, monthlyVisitors,
        uniqueVisitors: uniqueSessions.length || 0,
        returningVisitors, bounceRate: Math.min(100, bounceRate),
        totalPageViews: 0, avgSessionDuration: 0, totalDownloads: 0,
        totalMessages: messages, activeProjects: projects,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVisitorStats = async (req, res) => {
  try {
    const range = req.query.range || '30d';
    const now = new Date();
    let start, fmt;
    if (range === 'today') { start = new Date(now.getFullYear(), now.getMonth(), now.getDate()); fmt = { $dateToString: { format: '%H:00', date: '$createdAt' } }; }
    else if (range === '7d' || range === '30d' || range === '90d') { start = new Date(now.getTime() - parseInt(range) * 86400000); fmt = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }; }
    else if (range === '1y') { start = new Date(now.getTime() - 365 * 86400000); fmt = { $dateToString: { format: '%Y-%m', date: '$createdAt' } }; }
    else { start = new Date(now.getTime() - 30 * 86400000); fmt = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }; }

    const stats = await Visitor.aggregate([
      { $match: { createdAt: { $gte: start } } },
      { $group: { _id: fmt, count: { $sum: 1 }, unique: { $addToSet: '$sessionId' }, pageViews: { $sum: '$pageViews' } } },
      { $sort: { _id: 1 } },
    ]).catch(() => []);

    res.json({ success: true, data: stats.map((s) => ({ date: s._id, count: s.count, unique: s.unique.length, pageViews: s.pageViews || 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVisitorLocations = async (req, res) => {
  try {
    const countries = await Visitor.aggregate([
      { $group: { _id: '$country', count: { $sum: 1 }, unique: { $addToSet: '$sessionId' } } },
      { $sort: { count: -1 } }, { $limit: 20 },
    ]).catch(() => []);
    const cities = await Visitor.aggregate([
      { $group: { _id: { country: '$country', city: '$city' }, count: { $sum: 1 } } },
      { $sort: { count: -1 } }, { $limit: 20 },
    ]).catch(() => []);
    const total = countries.reduce((s, c) => s + c.count, 0);
    res.json({
      success: true,
      data: {
        countries: countries.map((c) => ({ country: c._id, count: c.count, unique: c.unique.length, percentage: total > 0 ? Math.round((c.count / total) * 1000) / 10 : 0 })),
        cities: cities.map((c) => ({ country: c._id.country, city: c._id.city, count: c.count })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDeviceStats = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const devices = await Visitor.aggregate([
      { $match: { createdAt: { $gte: df } } },
      { $group: { _id: '$device', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]).catch(() => []);
    const total = devices.reduce((s, d) => s + d.value, 0);
    res.json({ success: true, data: devices.map((d) => ({ name: d._id, value: d.value, percentage: total > 0 ? Math.round((d.value / total) * 100) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBrowserStats = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const browsers = await Visitor.aggregate([
      { $match: { createdAt: { $gte: df } } },
      { $group: { _id: '$browser', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]).catch(() => []);
    const total = browsers.reduce((s, d) => s + d.value, 0);
    res.json({ success: true, data: browsers.map((b) => ({ name: b._id, value: b.value, percentage: total > 0 ? Math.round((b.value / total) * 100) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getOSStats = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const os = await Visitor.aggregate([
      { $match: { createdAt: { $gte: df } } },
      { $group: { _id: '$os', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]).catch(() => []);
    const total = os.reduce((s, d) => s + d.value, 0);
    res.json({ success: true, data: os.map((d) => ({ name: d._id, value: d.value, percentage: total > 0 ? Math.round((d.value / total) * 100) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPageStats = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const pages = await Visitor.aggregate([
      { $match: { createdAt: { $gte: df } } },
      { $unwind: { path: '$pages', preserveNullAndEmptyArrays: false } },
      { $group: { _id: '$pages.path', views: { $sum: 1 }, unique: { $addToSet: '$sessionId' }, totalDuration: { $sum: '$pages.duration' } } },
      { $sort: { views: -1 } },
    ]).catch(() => []);
    res.json({ success: true, data: pages.map((p) => ({ path: p._id || '/', views: p.views, unique: p.unique.length, avgTime: p.views > 0 ? Math.round(p.totalDuration / p.views) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getReferrerStats = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const referrers = await Visitor.aggregate([
      { $match: { createdAt: { $gte: df } } },
      { $group: { _id: '$referrer', value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]).catch(() => []);
    const total = referrers.reduce((s, d) => s + d.value, 0);
    res.json({ success: true, data: referrers.map((d) => ({ source: d._id || 'Direct', count: d.value, percentage: total > 0 ? Math.round((d.value / total) * 100) : 0 })) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessionStats = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const sessions = await Visitor.find(
      { createdAt: { $gte: df }, sessionDuration: { $gt: 0 } },
      'sessionId sessionDuration pageViews country device browser createdAt'
    ).sort({ sessionDuration: -1 }).limit(100).lean().catch(() => []);
    res.json({ success: true, data: { sessions, avgDuration: 0, maxDuration: 0, totalSessions: 0 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActiveVisitors = async (req, res) => {
  try {
    const fiveMinAgo = new Date(Date.now() - 300000);
    const active = await Visitor.find(
      { lastActivity: { $gte: fiveMinAgo } },
      'sessionId country city device browser pages lastActivity referrer ip'
    ).sort({ lastActivity: -1 }).limit(50).lean().catch(() => []);
    res.json({
      success: true,
      data: {
        count: active.length,
        visitors: active.map((v) => ({
          id: v._id, sessionId: v.sessionId, country: v.country, city: v.city,
          device: v.device, browser: v.browser, currentPage: v.pages?.length > 0 ? v.pages[v.pages.length - 1].path : '/',
          lastActivity: v.lastActivity, referrer: v.referrer, ip: v.ip,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLiveFeed = async (req, res) => {
  try {
    const tenMinAgo = new Date(Date.now() - 600000);
    const recent = await Visitor.find(
      { createdAt: { $gte: tenMinAgo } },
      'country city device browser pages actions createdAt lastActivity downloads contactSubmissions'
    ).sort({ createdAt: -1 }).limit(30).lean().catch(() => []);
    const events = [];
    recent.forEach((v) => {
      const location = v.city !== 'Unknown' ? `${v.city}, ${v.country}` : v.country;
      const cp = v.pages?.length > 0 ? v.pages[v.pages.length - 1].path : '/';
      events.push({ type: 'visit', message: `Visitor from ${location} viewed ${cp || 'Home'} page`, timestamp: v.createdAt, country: v.country, city: v.city, device: v.device, browser: v.browser });
      if (v.downloads > 0) events.push({ type: 'download', message: `Visitor from ${location} downloaded CV`, timestamp: v.lastActivity, country: v.country });
      if (v.contactSubmissions > 0) events.push({ type: 'contact', message: `Visitor from ${location} submitted contact form`, timestamp: v.lastActivity, country: v.country });
      (v.actions || []).forEach((a) => { events.push({ type: 'action', message: `Visitor from ${location} ${a.label || a.type || 'performed an action'}`, timestamp: a.timestamp || v.lastActivity, country: v.country }); });
    });
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ success: true, data: events.slice(0, 50) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVisitorDetails = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'createdAt', sortOrder = 'desc', startDate, endDate, country, device, browser } = req.query;
    const filter = {};
    if (startDate || endDate) { filter.createdAt = {}; if (startDate) filter.createdAt.$gte = new Date(startDate); if (endDate) filter.createdAt.$lte = new Date(endDate); }
    if (country) filter.country = country;
    if (device) filter.device = device;
    if (browser) filter.browser = browser;
    if (search) filter.$or = [{ country: { $regex: search, $options: 'i' } }, { city: { $regex: search, $options: 'i' } }, { browser: { $regex: search, $options: 'i' } }, { os: { $regex: search, $options: 'i' } }, { referrer: { $regex: search, $options: 'i' } }, { ip: { $regex: search, $options: 'i' } }];
    const sortObj = {}; sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;
    const [total, visitors] = await Promise.all([
      Visitor.countDocuments(filter).catch(() => 0),
      Visitor.find(filter).sort(sortObj).skip((parseInt(page) - 1) * parseInt(limit)).limit(parseInt(limit)).lean().catch(() => []),
    ]);
    res.json({ success: true, data: { visitors: visitors.map((v) => ({ id: v._id, visitDate: v.createdAt, country: v.country, city: v.city, region: v.region, timezone: v.timezone, device: v.device, browser: v.browser, os: v.os, screenResolution: v.screenResolution, language: v.language, referrer: v.referrer, sessionDuration: v.sessionDuration, pageViews: v.pageViews, pages: v.pages, actions: v.actions, downloads: v.downloads, contactSubmissions: v.contactSubmissions, isOnline: v.isOnline, lastActivity: v.lastActivity })), total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectAnalytics = async (req, res) => {
  try {
    const projects = await Project.find({ isActive: true }).select('title slug').lean().catch(() => []);
    const slugs = projects.map((p) => `/projects/${p.slug}`);
    const pageStats = await Visitor.aggregate([
      { $unwind: { path: '$pages', preserveNullAndEmptyArrays: false } },
      { $match: { 'pages.path': { $in: slugs } } },
      { $group: { _id: '$pages.path', views: { $sum: 1 }, unique: { $addToSet: '$sessionId' }, totalDuration: { $sum: '$pages.duration' } } },
    ]).catch(() => []);
    const projectData = projects.map((p) => {
      const s = pageStats.find((ps) => ps._id === `/projects/${p.slug}`);
      return { title: p.title, slug: p.slug, views: s?.views || 0, unique: s?.unique?.length || 0, avgTime: s?.views ? Math.round(s.totalDuration / s.views) : 0, githubClicks: 0, demoClicks: 0, projectClicks: 0, techFilterClicks: 0 };
    });
    projectData.sort((a, b) => b.views - a.views);
    res.json({ success: true, data: projectData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getResumeAnalytics = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const downloaders = await Visitor.find(
      { downloads: { $gt: 0 }, createdAt: { $gte: df } },
      'country city device browser createdAt os'
    ).sort({ createdAt: -1 }).limit(50).lean().catch(() => []);
    res.json({ success: true, data: { totalDownloads: 0, daily: [], downloaders: downloaders.map((d) => ({ date: d.createdAt, country: d.country, city: d.city, device: d.device, browser: d.browser, os: d.os })) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getContactAnalytics = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const submissions = await Message.find({ createdAt: { $gte: df } }, 'name email createdAt').sort({ createdAt: -1 }).lean().catch(() => []);
    res.json({ success: true, data: { total: submissions.length, daily: [], submissions: submissions.map((s) => ({ date: s.createdAt, name: s.name, email: s.email })) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const df = dateFilter(req.query.range || '30d');
    const [locations, devices, browsers, referrers, pageStats, visitorTrend, active] = await Promise.all([
      Visitor.aggregate([{ $match: { createdAt: { $gte: df } } }, { $group: { _id: '$country', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]).catch(() => []),
      Visitor.aggregate([{ $match: { createdAt: { $gte: df } } }, { $group: { _id: '$device', value: { $sum: 1 } } }]).catch(() => []),
      Visitor.aggregate([{ $match: { createdAt: { $gte: df } } }, { $group: { _id: '$browser', value: { $sum: 1 } } }]).catch(() => []),
      Visitor.aggregate([{ $match: { createdAt: { $gte: df } } }, { $group: { _id: '$referrer', value: { $sum: 1 } } }, { $sort: { value: -1 } }]).catch(() => []),
      Visitor.aggregate([{ $match: { createdAt: { $gte: df } } }, { $unwind: { path: '$pages', preserveNullAndEmptyArrays: false } }, { $group: { _id: '$pages.path', views: { $sum: 1 }, unique: { $addToSet: '$sessionId' } } }, { $sort: { views: -1 } }, { $limit: 10 }]).catch(() => []),
      Visitor.aggregate([{ $match: { createdAt: { $gte: df } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, unique: { $addToSet: '$sessionId' }, pageViews: { $sum: '$pageViews' } } }, { $sort: { _id: 1 } }]).catch(() => []),
      Visitor.find({ lastActivity: { $gte: new Date(Date.now() - 300000) } }, 'country city browser device pages lastActivity').sort({ lastActivity: -1 }).limit(10).lean().catch(() => []),
    ]);
    const tl = locations.reduce((s, l) => s + l.count, 0);
    const td = devices.reduce((s, d) => s + d.value, 0);
    const tb = browsers.reduce((s, b) => s + b.value, 0);
    const tr = referrers.reduce((s, r) => s + r.value, 0);
    res.json({
      success: true,
      data: {
        visitorTrend: visitorTrend.map((v) => ({ date: v._id, count: v.count, unique: v.unique?.length || 0, pageViews: v.pageViews || 0 })),
        locations: locations.map((l) => ({ country: l._id, count: l.count, percentage: tl > 0 ? Math.round((l.count / tl) * 1000) / 10 : 0 })),
        devices: devices.map((d) => ({ name: d._id, value: d.value, percentage: td > 0 ? Math.round((d.value / td) * 100) : 0 })),
        browsers: browsers.map((b) => ({ name: b._id, value: b.value, percentage: tb > 0 ? Math.round((b.value / tb) * 100) : 0 })),
        referrers: referrers.map((r) => ({ source: r._id || 'Direct', count: r.value, percentage: tr > 0 ? Math.round((r.value / tr) * 100) : 0 })),
        topPages: pageStats.map((p) => ({ path: p._id || '/', views: p.views, unique: p.unique?.length || 0 })),
        recentVisitors: active.map((v) => ({ country: v.country, city: v.city, browser: v.browser, device: v.device, page: v.pages?.[v.pages.length - 1]?.path || '/', lastActivity: v.lastActivity })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackVisit = async (req, res) => {
  try {
    const { sessionId, page, title, referrer, screenResolution, language, device, browser, os, country, city, region, timezone } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId required' });
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    let visitor = await Visitor.findOne({ sessionId });
    if (!visitor) {
      visitor = new Visitor({ sessionId, ip, country: country || 'Unknown', city: city || 'Unknown', region: region || '', timezone: timezone || '', device: device || 'Desktop', browser: browser || 'Chrome', os: os || 'Windows', screenResolution: screenResolution || '', language: language || '', referrer: referrer || 'Direct', sessionStart: new Date(), isOnline: true });
    }
    const now = new Date();
    visitor.lastActivity = now;
    visitor.isOnline = true;
    visitor.ip = ip;
    if (country) visitor.country = country;
    if (city) visitor.city = city;
    if (device) visitor.device = device;
    if (browser) visitor.browser = browser;
    if (os) visitor.os = os;
    if (referrer) visitor.referrer = referrer;
    if (screenResolution) visitor.screenResolution = screenResolution;
    if (language) visitor.language = language;
    const existingPage = visitor.pages.find((p) => p.path === page);
    if (existingPage) { existingPage.exitTime = now; if (existingPage.entryTime) existingPage.duration = Math.round((now - new Date(existingPage.entryTime)) / 1000); }
    else if (page) visitor.pages.push({ path: page, title: title || '', entryTime: now });
    visitor.pageViews = visitor.pages.length;
    if (visitor.sessionStart) visitor.sessionDuration = Math.round((now - new Date(visitor.sessionStart)) / 1000);
    await visitor.save();
    res.json({ success: true, data: { visitorId: visitor._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackAction = async (req, res) => {
  try {
    const { sessionId, type, target, label } = req.body;
    if (!sessionId || !type) return res.status(400).json({ success: false, message: 'sessionId and type required' });
    const visitor = await Visitor.findOne({ sessionId });
    if (!visitor) return res.status(404).json({ success: false, message: 'Session not found' });
    visitor.actions.push({ type, target, label, timestamp: new Date() });
    visitor.lastActivity = new Date();
    if (type === 'download_cv' || type === 'resume_download') visitor.downloads = (visitor.downloads || 0) + 1;
    if (type === 'contact_submit') visitor.contactSubmissions = (visitor.contactSubmissions || 0) + 1;
    await visitor.save();
    res.json({ success: true, message: 'Action tracked' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'sessionId required' });
    const visitor = await Visitor.findOne({ sessionId });
    if (visitor) { visitor.isOnline = false; visitor.sessionEnd = new Date(); if (visitor.sessionStart) visitor.sessionDuration = Math.round((new Date() - new Date(visitor.sessionStart)) / 1000); await visitor.save(); }
    res.json({ success: true, message: 'Session ended' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getExportData = async (req, res) => {
  try {
    const { type = 'visitors', format = 'json', startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) { filter.createdAt = {}; if (startDate) filter.createdAt.$gte = new Date(startDate); if (endDate) filter.createdAt.$lte = new Date(endDate); }
    if (type === 'visitors') {
      const visitors = await Visitor.find(filter).sort({ createdAt: -1 }).lean().catch(() => []);
      if (format === 'csv') {
        const headers = 'VisitDate,Country,City,Device,Browser,OS,PageViews,SessionDuration,Referrer';
        const rows = visitors.map((v) => `"${v.createdAt}","${v.country}","${v.city}","${v.device}","${v.browser}","${v.os}",${v.pageViews},${v.sessionDuration},"${v.referrer}"`);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=visitors.csv');
        return res.send([headers, ...rows].join('\n'));
      }
      return res.json({ success: true, data: visitors });
    }
    res.json({ success: true, data: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
