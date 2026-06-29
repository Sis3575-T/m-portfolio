const AccessibilityIssue = require('../models/AccessibilityIssue');

exports.getIssues = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, impact, page: pageFilter, isFixed } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (impact) filter.impact = impact;
    if (pageFilter) filter.page = pageFilter;
    if (isFixed !== undefined) filter.isFixed = isFixed === 'true';

    const [total, issues] = await Promise.all([
      AccessibilityIssue.countDocuments(filter),
      AccessibilityIssue.find(filter)
        .sort({ detectedAt: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit))
        .lean(),
    ]);

    res.json({
      success: true,
      data: issues,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getSummary = async (req, res) => {
  try {
    const [total, byType, byImpact, fixed, open] = await Promise.all([
      AccessibilityIssue.countDocuments(),
      AccessibilityIssue.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      AccessibilityIssue.aggregate([
        { $group: { _id: '$impact', count: { $sum: 1 } } },
      ]),
      AccessibilityIssue.countDocuments({ isFixed: true }),
      AccessibilityIssue.countDocuments({ isFixed: false }),
    ]);

    const toMap = (arr) => {
      const map = {};
      arr.forEach((item) => { map[item._id] = item.count; });
      return map;
    };

    res.json({
      success: true,
      data: {
        total,
        byType: toMap(byType),
        byImpact: toMap(byImpact),
        fixed,
        open,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createIssue = async (req, res) => {
  try {
    const { page, type, element, impact, description, recommendation } = req.body;
    if (!page || !type) {
      return res.status(400).json({ success: false, message: 'page and type are required' });
    }

    const issue = await AccessibilityIssue.create({
      page,
      type,
      element: element || '',
      impact: impact || 'moderate',
      description: description || '',
      recommendation: recommendation || '',
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateIssue = async (req, res) => {
  try {
    const issue = await AccessibilityIssue.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsFixed = async (req, res) => {
  try {
    const issue = await AccessibilityIssue.findByIdAndUpdate(
      req.params.id,
      { isFixed: true, fixedAt: new Date() },
      { new: true }
    );
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.json({ success: true, data: issue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteIssue = async (req, res) => {
  try {
    const issue = await AccessibilityIssue.findByIdAndDelete(req.params.id);
    if (!issue) return res.status(404).json({ success: false, message: 'Issue not found' });
    res.json({ success: true, message: 'Issue deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.runAudit = async (req, res) => {
  try {
    const { page, html, url } = req.body;
    if (!page || (!html && !url)) {
      return res.status(400).json({ success: false, message: 'page and either html or url are required' });
    }

    let content = html;

    // If url is provided instead of html, fetch it
    if (url && !html) {
      try {
        const https = require('https');
        const http = require('http');
        const protocol = url.startsWith('https') ? https : http;
        content = await new Promise((resolve, reject) => {
          protocol.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => resolve(data));
          }).on('error', reject);
        });
      } catch {
        return res.status(400).json({ success: false, message: 'Failed to fetch URL content' });
      }
    }

    if (!content) {
      return res.status(400).json({ success: false, message: 'No HTML content to audit' });
    }

    const issues = [];
    const imgRegex = /<img[^>]*>/gi;
    const styleAttrRegex = /style\s*=\s*["'][^"']*color[^"']*["']/gi;
    const headingRegex = /<h[1-6][^>]*>/gi;
    const labelRegex = /<label[^>]*>/gi;
    const inputRegex = /<input[^>]*>/gi;
    const textareaRegex = /<textarea[^>]*>/gi;
    const selectRegex = /<select[^>]*>/gi;
    const formRegex = /<form[^>]*>/gi;

    // Check for missing alt text on images
    let imgMatch;
    while ((imgMatch = imgRegex.exec(content)) !== null) {
      if (!/alt\s*=\s*["']/.test(imgMatch[0])) {
        issues.push({
          type: 'missing_alt',
          element: imgMatch[0].substring(0, 100),
          impact: 'critical',
          description: 'Image missing alt text',
          recommendation: 'Add alt attribute describing the image content',
        });
      }
    }

    // Check for inline styles with color (possible contrast issues)
    let styleMatch;
    while ((styleMatch = styleAttrRegex.exec(content)) !== null) {
      issues.push({
        type: 'poor_contrast',
        element: styleMatch[0].substring(0, 100),
        impact: 'serious',
        description: 'Inline style with color detected',
        recommendation: 'Use CSS classes with sufficient color contrast ratio',
      });
    }

    // Check heading order
    const headings = [];
    let hMatch;
    while ((hMatch = headingRegex.exec(content)) !== null) {
      const level = parseInt(hMatch[0].match(/h([1-6])/i)[1]);
      headings.push(level);
    }

    let prevLevel = 0;
    for (const level of headings) {
      if (level > prevLevel + 1 && prevLevel > 0) {
        issues.push({
          type: 'heading_structure',
          element: `<h${level}>`,
          impact: 'moderate',
          description: `Skipped heading level from h${prevLevel} to h${level}`,
          recommendation: `Use h${prevLevel + 1} instead of h${level} to maintain proper hierarchy`,
        });
        break;
      }
      prevLevel = level;
    }

    if (!headings.includes(1)) {
      issues.push({
        type: 'heading_structure',
        element: 'body',
        impact: 'serious',
        description: 'Page is missing an h1 heading',
        recommendation: 'Add an h1 heading that describes the page content',
      });
    }

    // Check for form inputs without labels
    const formElements = content.match(inputRegex) || [];
    formElements.push(...(content.match(textareaRegex) || []));
    formElements.push(...(content.match(selectRegex) || []));
    const labels = content.match(labelRegex) || [];

    const hasForm = formRegex.test(content);
    if (hasForm && formElements.length > 0 && labels.length === 0) {
      issues.push({
        type: 'missing_label',
        element: 'form',
        impact: 'serious',
        description: 'Form has inputs but no label elements found',
        recommendation: 'Add label elements for each form input to improve accessibility',
      });
    }

    // Save all detected issues
    const saved = [];
    for (const issue of issues) {
      const created = await AccessibilityIssue.create({
        page,
        type: issue.type,
        element: issue.element,
        impact: issue.impact,
        description: issue.description,
        recommendation: issue.recommendation,
      });
      saved.push(created);
    }

    res.json({
      success: true,
      data: {
        issues: saved,
        total: saved.length,
        summary: {
          critical: saved.filter((i) => i.impact === 'critical').length,
          serious: saved.filter((i) => i.impact === 'serious').length,
          moderate: saved.filter((i) => i.impact === 'moderate').length,
          minor: saved.filter((i) => i.impact === 'minor').length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
