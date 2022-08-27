const express = require('express');
const requestController = require('../controllers/requestController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(requestController.getAllRequests);

router
  .route('/create')
  .post(
    authController.protect,
    authController.restrictTo('needy'),
    requestController.createRequest
  );

module.exports = router;
