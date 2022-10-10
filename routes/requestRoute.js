const express = require('express');
const requestController = require('../controllers/requestController');
const authController = require('../controllers/authController');
const donationController = require('../controllers/donationController');

const router = express.Router();

router.route('/').get(requestController.getAllRequests);

router
  .route('/create')
  .post(
    authController.protect,
    authController.restrictTo('needy'),
    requestController.createRequest
  );

router.get(
  '/checkoutsession/:amount/:request',
  authController.protect,
  authController.restrictTo('donator'),
  requestController.getCheckoutSession
);

router.post(
  '/create-donations',
  authController.protect,
  requestController.createDonationCheckout,
  donationController.getMyDonations
);

router
  .route('/:id')
  .get(authController.protect, requestController.OneRequest)
  .patch(
    authController.protect,
    authController.restrictTo('needy', 'admin'),
    requestController.updateRequest
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'needy'),
    requestController.deleteRequest
  );

module.exports = router;
