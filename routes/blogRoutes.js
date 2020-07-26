const express = require('express');
const blogController = require('../controllers/blogController');
const authController = require('../controllers/authController');

const router = new express.Router();

router
  .route('/')
  .get(blogController.getBlogs)
  .post(
    authController.protect,
    authController.addUserToBodyPayload,
    blogController.createBlog
  );

router
  .route('/:id')
  .get(blogController.getBlog)
  .patch(authController.protect, blogController.updateBlog)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    blogController.deleteBlog
  );
module.exports = router;
