const mongoose = require('mongoose');
const slugify = require('slugify');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  slug: {
    type: String,
  },
  shortDescription: {
    type: String,
  },
  description: {
    type: String,
  },
  featuredImage: {
    type: String,
  },
  label: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  hasPopUp: {
    type: Boolean,
    default: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  tags: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tag',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  sorting: {
    type: Number,
  },
});

// Add slug by slugify title
blogSchema.pre('save', function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
