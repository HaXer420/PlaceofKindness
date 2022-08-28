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

router
  .route('/:id')
  .get(authController.protect, requestController.OneRequest)
  .patch(
    authController.protect,
    authController.restrictTo('needy'),
    requestController.updateRequest
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    requestController.deleteRequest
  );

module.exports = router;
