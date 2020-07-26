const factory = require('./controllerFactory');
const Tag = require('../models/tagModel');

exports.addTag = factory.createOne(Tag);
exports.updateTag = factory.updateOne(Tag);
exports.getTag = factory.findOne(Tag);
exports.getTags = factory.findAll(Tag);
exports.deleteTag = factory.deleteOne(Tag);
