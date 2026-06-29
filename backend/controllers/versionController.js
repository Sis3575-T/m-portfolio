const VersionHistory = require('../models/VersionHistory');
const mongoose = require('mongoose');

exports.getVersions = async (req, res) => {
  try {
    const { resource, resourceId, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (resource) filter.resource = resource;
    if (resourceId) filter.resourceId = resourceId;

    const [total, versions] = await Promise.all([
      VersionHistory.countDocuments(filter),
      VersionHistory.find(filter)
        .populate('createdBy', 'name email')
        .sort({ version: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: versions,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVersionById = async (req, res) => {
  try {
    const version = await VersionHistory.findById(req.params.id)
      .populate('createdBy', 'name email')
      .lean();
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });
    res.json({ success: true, data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createVersion = async ({ resource, resourceId, data, changes, userId }) => {
  try {
    const lastVersion = await VersionHistory.findOne({ resource, resourceId })
      .sort({ version: -1 })
      .select('version')
      .lean();
    const version = (lastVersion?.version || 0) + 1;
    return await VersionHistory.create({ resource, resourceId, version, data, changes, createdBy: userId });
  } catch (error) {
    console.error('Failed to create version:', error.message);
  }
};

exports.restoreVersion = async (req, res) => {
  try {
    const version = await VersionHistory.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    const Model = mongoose.model(version.resource);
    if (!Model) return res.status(400).json({ success: false, message: `Unknown resource: ${version.resource}` });

    const updated = await Model.findByIdAndUpdate(version.resourceId, version.data, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ success: false, message: 'Resource not found' });

    res.json({ success: true, data: updated, message: 'Version restored successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.compareVersions = async (req, res) => {
  try {
    const { id1, id2 } = req.body;
    if (!id1 || !id2) return res.status(400).json({ success: false, message: 'id1 and id2 are required' });

    const [v1, v2] = await Promise.all([
      VersionHistory.findById(id1).lean(),
      VersionHistory.findById(id2).lean(),
    ]);

    if (!v1) return res.status(404).json({ success: false, message: 'Version 1 not found' });
    if (!v2) return res.status(404).json({ success: false, message: 'Version 2 not found' });

    res.json({ success: true, data: { version1: v1, version2: v2 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteVersion = async (req, res) => {
  try {
    const version = await VersionHistory.findByIdAndDelete(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });
    res.json({ success: true, message: 'Version deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
