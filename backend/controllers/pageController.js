const Page = require('../models/Page');

exports.getPages = async (req, res) => {
  try {
    const pages = await Page.find().sort('order');
    res.json({ success: true, data: pages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createPage = async (req, res) => {
  try {
    const { title, slug, description, insertAfter } = req.body;
    let order = 0;

    const pageCount = await Page.countDocuments();
    order = pageCount;

    if (insertAfter) {
      const afterPage = await Page.findOne({ slug: insertAfter });
      if (afterPage) {
        order = afterPage.order + 1;
        await Page.updateMany({ order: { $gte: order } }, { $inc: { order: 1 } });
      }
    }

    const page = await Page.create({
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      description,
      order,
    });

    res.status(201).json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updatePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deletePage = async (req, res) => {
  try {
    const page = await Page.findByIdAndDelete(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.duplicatePage = async (req, res) => {
  try {
    const source = await Page.findById(req.params.id);
    if (!source) return res.status(404).json({ success: false, message: 'Page not found' });

    const pageCount = await Page.countDocuments();
    const duplicate = await Page.create({
      title: `${source.title} (Copy)`,
      slug: `${source.slug}-copy-${Date.now()}`,
      description: source.description,
      isPublished: false,
      order: pageCount,
      components: source.components.map(c => ({ ...c, _id: undefined })),
      metaTitle: source.metaTitle,
      metaDescription: source.metaDescription,
      metaKeywords: source.metaKeywords,
    });

    res.status(201).json({ success: true, data: duplicate });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderPages = async (req, res) => {
  try {
    const { items } = req.body;
    const ops = items.map(item => ({
      updateOne: { filter: { _id: item._id }, update: { order: item.order } },
    }));
    await Page.bulkWrite(ops);
    res.json({ success: true, message: 'Pages reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.togglePage = async (req, res) => {
  try {
    const page = await Page.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    page.isPublished = !page.isPublished;
    await page.save();
    res.json({ success: true, data: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Component operations
exports.getComponents = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page.components.sort((a, b) => a.order - b.order) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addComponent = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const component = {
      type: req.body.type || 'custom',
      title: req.body.title || '',
      subtitle: '',
      description: '',
      buttonText: '',
      buttonLink: '',
      content: {},
      styles: {},
      advanced: {},
      isVisible: true,
      order: page.components.length,
    };

    page.components.push(component);
    await page.save();

    const saved = page.components[page.components.length - 1];
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComponent = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const component = page.components.id(req.params.componentId);
    if (!component) return res.status(404).json({ success: false, message: 'Component not found' });

    Object.assign(component, req.body);
    await page.save();

    res.json({ success: true, data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteComponent = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    page.components = page.components.filter(c => c._id.toString() !== req.params.componentId);
    await page.save();

    res.json({ success: true, message: 'Component deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.duplicateComponent = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const source = page.components.id(req.params.componentId);
    if (!source) return res.status(404).json({ success: false, message: 'Component not found' });

    const duplicate = { ...source.toObject(), _id: undefined, title: `${source.title} (Copy)`, order: page.components.length };
    page.components.push(duplicate);
    await page.save();

    const saved = page.components[page.components.length - 1];
    res.status(201).json({ success: true, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reorderComponents = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const { items } = req.body;
    for (const item of items) {
      const comp = page.components.id(item._id);
      if (comp) comp.order = item.order;
    }
    await page.save();

    res.json({ success: true, message: 'Components reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleComponent = async (req, res) => {
  try {
    const page = await Page.findById(req.params.pageId);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const component = page.components.id(req.params.componentId);
    if (!component) return res.status(404).json({ success: false, message: 'Component not found' });

    component.isVisible = !component.isVisible;
    await page.save();

    res.json({ success: true, data: component });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.moveComponent = async (req, res) => {
  try {
    const { targetPageId } = req.body;
    const sourcePage = await Page.findById(req.params.pageId);
    if (!sourcePage) return res.status(404).json({ success: false, message: 'Source page not found' });

    const component = sourcePage.components.id(req.params.componentId);
    if (!component) return res.status(404).json({ success: false, message: 'Component not found' });

    const compData = { ...component.toObject() };
    sourcePage.components = sourcePage.components.filter(c => c._id.toString() !== req.params.componentId);
    await sourcePage.save();

    const targetPage = await Page.findById(targetPageId);
    if (!targetPage) return res.status(404).json({ success: false, message: 'Target page not found' });

    delete compData._id;
    compData.order = targetPage.components.length;
    targetPage.components.push(compData);
    await targetPage.save();

    res.json({ success: true, message: 'Component moved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
