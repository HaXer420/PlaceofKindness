const express = require('express');
const postController = require('../controllers/postController');

const router = express.Router();

router.route('/').get(postController.getAllPost);

module.exports = router;
