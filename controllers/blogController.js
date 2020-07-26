const factory = require('./controllerFactory');
const Blog = require('../models/blogModel');

exports.createBlog = factory.createOne(Blog);
exports.getBlogs = factory.findAll(Blog);
exports.getBlog = factory.findOne(Blog);
exports.updateBlog = factory.updateOne(Blog);
exports.deleteBlog = factory.deleteOne(Blog);
