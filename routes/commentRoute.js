const express = require('express');
const commentController = require('../controllers/commentController');

const router = express.Router();

router.route('/').get(commentController.getAllComments);

module.exports = router;
