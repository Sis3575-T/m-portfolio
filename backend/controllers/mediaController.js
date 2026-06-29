const fs = require('fs');
const path = require('path');
const Media = require('../models/Media');

exports.getMedia = async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const total = await Media.countDocuments(filter);
    const media = await Media.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, data: media, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMediaById = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id).populate('uploadedBy', 'name');
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const fileUrl = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;
    const media = await Media.create({
      name: req.file.originalname.replace(/\.[^/.]+$/, ''),
      originalName: req.file.originalname,
      url: fileUrl,
      publicId: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      category: req.body.category || 'image',
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMedia = async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    res.json({ success: true, data: media });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media not found' });
    const filePath = path.join(__dirname, '..', 'uploads', media.publicId);
    if (media.publicId && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const folders = await Media.distinct('folder', { folder: { $ne: '' } });
    res.json({ success: true, data: folders.sort() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMediaStats = async (req, res) => {
  try {
    const total = await Media.countDocuments();
    const images = await Media.countDocuments({ category: 'image' });
    const documents = await Media.countDocuments({ category: 'document' });
    const resumes = await Media.countDocuments({ category: 'resume' });
    const certificates = await Media.countDocuments({ category: 'certificate' });
    const totalSize = await Media.aggregate([{ $group: { _id: null, total: { $sum: '$size' } } }]);
    res.json({
      success: true,
      data: { total, images, documents, resumes, certificates, totalSize: totalSize[0]?.total || 0 },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
