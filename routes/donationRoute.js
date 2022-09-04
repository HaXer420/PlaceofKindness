const express = require('express');
const authController = require('../controllers/authController');
const donationController = require('../controllers/donationController');

const router = express.Router();

router.route('/top3don').get(donationController.Top3Don);

router.route('/top5don').get(donationController.Top5Don);

router.get(
  '/checkoutsession/:amount',
  authController.protect,
  authController.restrictTo('donator'),
  donationController.getCheckoutSession
);

// router.get(
//   '/my-donations',
//   authController.protect,
//   donationController.getMyDonations
// );

module.exports = router;
