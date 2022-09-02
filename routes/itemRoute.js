const express = require('express');
const itemController = require('../controllers/itemController');
const authController = require('../controllers/authController');
const getItemRouter = require('./needyItemRoute');

const router = express.Router();

router.use('/:itemid/needyitem', getItemRouter);

router.route('/').get(itemController.getAllItem);

router.get(
  '/unavailableitems',
  authController.protect,
  authController.restrictTo('admin'),
  itemController.unavailableItems
);

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
