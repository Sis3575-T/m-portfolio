const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateAccessToken = (id) => {
  return jwt.sign({ id, type: 'access' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id, type: 'refresh' }, process.env.JWT_SECRET + '_refresh', { expiresIn: '7d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const ip = req.ip || req.socket?.remoteAddress || req.connection?.remoteAddress || '';
    const ua = req.headers['user-agent'] || '';
    await ActivityLog.create({ user: user._id, action: 'auth.login', details: { ip, ua }, ip, browser: ua });

    res.json({ success: true, token: accessToken, refreshToken, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET + '_refresh');
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken(user._id);
    res.json({ success: true, token: accessToken });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

exports.logout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    await ActivityLog.create({ user: req.user._id, action: 'auth.logout' });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = [
      'name', 'firstName', 'lastName', 'displayName', 'username', 'bio',
      'jobTitle', 'company', 'website', 'phone', 'altPhone',
      'country', 'state', 'city', 'postalCode', 'address',
      'secondaryEmail', 'avatar',
      'social',
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.file) updates.avatar = '/uploads/' + req.file.filename;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });

    const completion = calculateProfileCompletion(user);
    await User.findByIdAndUpdate(req.user._id, { profileCompletion: completion });

    // Sync profile changes to Hero + Settings models so frontend reflects updates
    try {
      const Hero = require('../models/Hero');
      const Settings = require('../models/Settings');
      if (updates.avatar !== undefined) {
        await Hero.findOneAndUpdate({}, { $set: { avatar: updates.avatar } });
        await Settings.findOneAndUpdate({}, { $set: { profilePhoto: updates.avatar } });
      }
      if (updates.name) {
        await Hero.findOneAndUpdate({}, { $set: { name: updates.name } });
      }
      if (updates.bio) {
        await Hero.findOneAndUpdate({}, { $set: { introduction: updates.bio } });
      }
      if (updates.jobTitle) {
        await Hero.findOneAndUpdate({}, { $set: { role: updates.jobTitle } });
      }
    } catch (err) {
      console.error('Profile sync error:', err.message);
    }

    await ActivityLog.create({ user: req.user._id, action: 'profile.updated' });
    res.json({ success: true, user: { ...user.toJSON(), profileCompletion: completion } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const allowed = ['theme', 'accentColor', 'sidebarStyle', 'tableDensity', 'animations', 'defaultDashboard', 'defaultLandingPage', 'dateFormat', 'timeFormat', 'timezone', 'language', 'itemsPerPage'];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[`preferences.${key}`] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    await ActivityLog.create({ user: req.user._id, action: 'preferences.updated' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateNotifications = async (req, res) => {
  try {
    const updates = {};
    if (req.body.email) {
      for (const key of Object.keys(req.body.email)) {
        updates[`notifications.email.${key}`] = req.body.email[key];
      }
    }
    if (req.body.browser) {
      for (const key of Object.keys(req.body.browser)) {
        updates[`notifications.browser.${key}`] = req.body.browser[key];
      }
    }
    if (req.body.sound !== undefined) updates['notifications.sound'] = req.body.sound;
    if (req.body.desktop !== undefined) updates['notifications.desktop'] = req.body.desktop;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    await ActivityLog.create({ user: req.user._id, action: 'notifications.updated' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('sessions');
    const currentToken = req.headers.authorization?.split(' ')[1];
    const sessions = (user.sessions || []).map(s => ({
      ...s.toObject(),
      isCurrent: s.token === currentToken,
    })).sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.terminateSession = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { sessions: { _id: req.params.id } }
    });
    await ActivityLog.create({ user: req.user._id, action: 'session.terminated' });
    res.json({ success: true, message: 'Session terminated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.terminateOtherSessions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const currentToken = req.headers.authorization?.split(' ')[1];
    user.sessions = user.sessions.filter(s => s.token === currentToken);
    await user.save();
    await ActivityLog.create({ user: req.user._id, action: 'sessions.terminated_other' });
    res.json({ success: true, message: 'Other sessions terminated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.logoutAllSessions = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { sessions: [], refreshToken: null });
    await ActivityLog.create({ user: req.user._id, action: 'sessions.logout_all' });
    res.json({ success: true, message: 'Logged out of all devices' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.connectAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    const allowed = ['github', 'linkedin', 'google'];
    if (!allowed.includes(provider)) {
      return res.status(400).json({ success: false, message: 'Invalid provider' });
    }
    const update = {};
    update[`connectedAccounts.${provider}`] = { connected: true, ...req.body, email: req.body.email || '' };
    await User.findByIdAndUpdate(req.user._id, update);
    await ActivityLog.create({ user: req.user._id, action: `account.connected.${provider}` });
    res.json({ success: true, message: `${provider} connected` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.disconnectAccount = async (req, res) => {
  try {
    const { provider } = req.params;
    const update = {};
    update[`connectedAccounts.${provider}`] = { connected: false, email: null, username: null, url: null };
    await User.findByIdAndUpdate(req.user._id, update);
    await ActivityLog.create({ user: req.user._id, action: `account.disconnected.${provider}` });
    res.json({ success: true, message: `${provider} disconnected` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user._id);
    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deactivateAccount = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false, deactivatedAt: new Date() });
    res.json({ success: true, message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateTwoFactor = async (req, res) => {
  try {
    const { enabled } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { 
      twoFactorEnabled: enabled,
      ...(enabled && { recoveryCodes: generateRecoveryCodes() }),
    }, { new: true });
    res.json({ success: true, twoFactorEnabled: user.twoFactorEnabled, recoveryCodes: user.recoveryCodes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function calculateProfileCompletion(user) {
  let score = 0;
  const checks = [
    user.avatar, user.bio, user.phone, user.jobTitle, user.website,
    user.country, user.city, user.social?.github, user.social?.linkedin,
    user.social?.twitter, user.preferences?.timezone,
  ];
  for (const check of checks) { if (check) score += 100 / 11; }
  return Math.min(Math.round(score), 100);
}

function generateRecoveryCodes() {
  const codes = [];
  for (let i = 0; i < 8; i++) {
    codes.push(Math.random().toString(36).substr(2, 8).toUpperCase());
  }
  return codes;
}
