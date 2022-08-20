const express = require('express');
const itemController = require('../controllers/itemController');

const router = express.Router();

router.route('/').get(itemController.getAllItem);

module.exports = router;
