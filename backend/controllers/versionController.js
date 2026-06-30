const Version = require('../models/Version');

exports.getVersions = async (req, res) => {
  try {
    const { resource, resourceId } = req.params;
    const versions = await Version.find({ resource, resourceId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: versions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVersion = async (req, res) => {
  try {
    const version = await Version.findById(req.params.id).populate('user', 'name email');
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });
    res.json({ success: true, data: version });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.restoreVersion = async (req, res) => {
  try {
    const version = await Version.findById(req.params.id);
    if (!version) return res.status(404).json({ success: false, message: 'Version not found' });

    const Model = require(`../models/${version.resource}`);
    await Model.findByIdAndUpdate(version.resourceId, version.data, { new: true });

    await Version.create({
      resource: version.resource,
      resourceId: version.resourceId,
      data: version.data,
      action: 'restore',
      user: req.user._id,
      description: `Restored to version from ${version.createdAt}`,
    });

    res.json({ success: true, message: 'Version restored', data: version.data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.compareVersions = async (req, res) => {
  try {
    const { id1, id2 } = req.params;
    const [v1, v2] = await Promise.all([
      Version.findById(id1),
      Version.findById(id2),
    ]);
    if (!v1 || !v2) return res.status(404).json({ success: false, message: 'Version not found' });
    res.json({ success: true, data: { version1: v1, version2: v2 } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
