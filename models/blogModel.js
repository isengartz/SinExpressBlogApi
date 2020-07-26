const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
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
  tags: [
    {
      type: String,
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

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
