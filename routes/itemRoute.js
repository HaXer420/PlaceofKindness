const express = require('express');
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/').get(itemController.getAllItem);

router
  .route('/createItem')
  .post(
    authController.protect,
    authController.restrictTo('donator'),
    itemController.setItemUser,
    itemController.createItem
  );

router
  .route('/:id')
  .get(itemController.getItem)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    itemController.updateItem
  )
  .delete(authController.protect, itemController.deleteItem);

module.exports = router;
