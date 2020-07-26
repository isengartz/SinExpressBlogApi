const mongoose = require('mongoose');

const tagSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  blogs: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Blog',
    },
  ],
  icon: String,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Tag = mongoose.model('Tag', tagSchema);
module.exports = Tag;
