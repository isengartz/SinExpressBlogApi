const express = require('express');
const blogController = require('../controllers/blogController');

const router = new express.Router();

router.route('/').get(blogController.getBlogs).post(blogController.createBlog);

router.route('/:id').get(blogController.getBlog);
module.exports = router;
