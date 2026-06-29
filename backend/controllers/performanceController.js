const PerformanceMetric = require('../models/PerformanceMetric');

exports.getPerformanceMetrics = async (req, res) => {
  try {
    const { page = 1, limit = 50, page: pageFilter, startDate, endDate } = req.query;
    const filter = {};
    if (pageFilter) filter.page = pageFilter;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const [total, metrics] = await Promise.all([
      PerformanceMetric.countDocuments(filter),
      PerformanceMetric.find(filter)
        .sort({ timestamp: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: metrics,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPerformanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const summary = await PerformanceMetric.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          avgLCP: { $avg: '$lcp' },
          avgFCP: { $avg: '$fcp' },
          avgCLS: { $avg: '$cls' },
          avgTTFB: { $avg: '$ttfb' },
          avgLoadTime: { $avg: '$loadTime' },
          avgDOMInteractive: { $avg: '$domInteractive' },
          totalSamples: { $sum: 1 },
        },
      },
    ]);

    const data = summary[0] || {
      avgLCP: 0, avgFCP: 0, avgCLS: 0, avgTTFB: 0,
      avgLoadTime: 0, avgDOMInteractive: 0, totalSamples: 0,
    };

    // Round averages
    for (const key of Object.keys(data)) {
      if (key !== 'totalSamples' && key !== '_id') {
        data[key] = Math.round(data[key] * 100) / 100;
      }
    }
    delete data._id;

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPagePerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const pageStats = await PerformanceMetric.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$page',
          avgLoadTime: { $avg: '$loadTime' },
          avgLCP: { $avg: '$lcp' },
          avgFCP: { $avg: '$fcp' },
          avgCLS: { $avg: '$cls' },
          avgTTFB: { $avg: '$ttfb' },
          samples: { $sum: 1 },
        },
      },
      { $sort: { samples: -1 } },
    ]);

    const data = pageStats.map((p) => ({
      page: p._id,
      avgLoadTime: Math.round(p.avgLoadTime * 100) / 100,
      avgLCP: Math.round(p.avgLCP * 100) / 100,
      avgFCP: Math.round(p.avgFCP * 100) / 100,
      avgCLS: Math.round(p.avgCLS * 100) / 100,
      avgTTFB: Math.round(p.avgTTFB * 100) / 100,
      samples: p.samples,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.trackPerformance = async (req, res) => {
  try {
    const { page, loadTime, lcp, fcp, cls, ttfb, domInteractive, imageSizes, device, browser, country } = req.body;
    if (!page) return res.status(400).json({ success: false, message: 'page is required' });

    const metric = await PerformanceMetric.create({
      page,
      loadTime: loadTime || 0,
      lcp: lcp || 0,
      fcp: fcp || 0,
      cls: cls || 0,
      ttfb: ttfb || 0,
      domInteractive: domInteractive || 0,
      imageSizes: imageSizes || 0,
      device: device || '',
      browser: browser || '',
      country: country || '',
    });

    res.status(201).json({ success: true, data: metric });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getImageSizes = async (req, res) => {
  try {
    const stats = await PerformanceMetric.aggregate([
      { $match: { imageSizes: { $gt: 0 } } },
      {
        $group: {
          _id: '$page',
          totalImageSize: { $sum: '$imageSizes' },
          avgImageSize: { $avg: '$imageSizes' },
          maxImageSize: { $max: '$imageSizes' },
          samples: { $sum: 1 },
        },
      },
      { $sort: { totalImageSize: -1 } },
    ]);

    const data = stats.map((s) => ({
      page: s._id,
      totalImageSize: s.totalImageSize,
      avgImageSize: Math.round(s.avgImageSize * 100) / 100,
      maxImageSize: s.maxImageSize,
      samples: s.samples,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
