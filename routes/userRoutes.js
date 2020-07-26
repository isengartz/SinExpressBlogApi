const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = new express.Router();

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUsers
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUser
  );
module.exports = router;
