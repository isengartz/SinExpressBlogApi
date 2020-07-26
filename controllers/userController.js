const User = require('../models/userModel');
const factory = require('./controllerFactory');

exports.getUser = factory.findOne(User);
exports.getUsers = factory.findAll(User);
