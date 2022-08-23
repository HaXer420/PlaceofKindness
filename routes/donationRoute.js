const express = require('express');
const donationController = require('../controllers/donationController');

const router = express.Router();

router.route('/top3don').get(donationController.Top3Don);

router.route('/top5don').get(donationController.Top5Don);

module.exports = router;
