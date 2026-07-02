const mongoose = require('mongoose');

const componentStylesSchema = new mongoose.Schema({
  backgroundColor: { type: String, default: '' },
  textColor: { type: String, default: '' },
  headingColor: { type: String, default: '' },
  borderColor: { type: String, default: '' },
  borderRadius: { type: String, default: '' },
  shadow: { type: String, default: '' },
  width: { type: String, default: '' },
  height: { type: String, default: '' },
  padding: { type: String, default: '' },
  margin: { type: String, default: '' },
  fontFamily: { type: String, default: '' },
  fontSize: { type: String, default: '' },
  fontWeight: { type: String, default: '' },
  alignment: { type: String, default: 'left' },
}, { _id: false });

const componentAdvancedSchema = new mongoose.Schema({
  customCSS: { type: String, default: '' },
  customClasses: { type: String, default: '' },
  animationType: { type: String, default: 'none' },
  animationDuration: { type: String, default: '300' },
  hoverEffects: { type: String, default: 'none' },
}, { _id: false });

const pageComponentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  description: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonLink: { type: String, default: '' },
  content: { type: mongoose.Schema.Types.Mixed, default: {} },
  styles: { type: componentStylesSchema, default: () => ({}) },
  advanced: { type: componentAdvancedSchema, default: () => ({}) },
  isVisible: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const seoSchema = new mongoose.Schema({
  metaTitle: { type: String, default: '' },
  metaDescription: { type: String, default: '' },
  keywords: { type: String, default: '' },
  ogImage: { type: String, default: '' },
  ogTitle: { type: String, default: '' },
  ogDescription: { type: String, default: '' },
}, { _id: false });

const pageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', default: null },
  template: { type: String, default: 'blank' },
  description: { type: String, default: '' },
  status: { type: String, enum: ['draft', 'published', 'scheduled', 'archived'], default: 'draft' },
  publishedAt: { type: Date, default: null },
  scheduledAt: { type: Date, default: null },
  unpublishAt: { type: Date, default: null },
  isHome: { type: Boolean, default: false },
  isProtected: { type: Boolean, default: false },
  password: { type: String, default: '' },
  order: { type: Number, default: 0 },
  components: [pageComponentSchema],
  sections: [{ type: mongoose.Schema.Types.Mixed }],
  seo: { type: seoSchema, default: () => ({}) },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

pageSchema.pre('save', function (next) {
  if (this.isHome) {
    return this.constructor.findOne({ isHome: true, _id: { $ne: this._id } })
      .then(homePage => {
        if (homePage) {
          const err = new Error('A home page already exists. Please unset the current home page first.');
          err.code = 'HOME_PAGE_EXISTS';
          return next(err);
        }
        next();
      })
      .catch(next);
  }
  next();
});

pageSchema.index({ parent: 1 });
pageSchema.index({ status: 1, publishedAt: -1 });

module.exports = mongoose.model('Page', pageSchema);
