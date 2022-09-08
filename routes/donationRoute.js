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

router.post(
  '/create-donations',
  authController.protect,
  donationController.createDonationCheckout,
  donationController.getMyDonations
);

router.get(
  '/my-donations',
  authController.protect,
  authController.restrictTo('donator'),
  donationController.getMyDonations
);

////////////////////////////
//// Admin Routes

router
  .route('all-donations')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    donationController.getAllDonation
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    donationController.getDonation
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    donationController.updateDonation
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    donationController.deleteDonation
  );

module.exports = router;
