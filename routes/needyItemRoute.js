const express = require('express');
const getItemController = require('../controllers/needyItemController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

// router.route('/').get(itemController.getAllItem);

/////////////////////////////////

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('needy'),
    getItemController.createGetItem
  );

router
  .route('/needyunsentitems')
  .get(
    authController.protect,
    authController.restrictTo('needy'),
    getItemController.needyunsentItems
  );
router
  .route('/needysentitems')
  .get(
    authController.protect,
    authController.restrictTo('needy'),
    getItemController.needysentItems
  );

router.get(
  '/unshipped',
  authController.protect,
  authController.restrictTo('admin'),
  getItemController.unsentItems
);

router.patch(
  '/itemshiptoneedy/:id',
  authController.protect,
  authController.restrictTo('admin'),
  getItemController.itemshippedtoneedy
);

router
  .route('/allpurchasing')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    getItemController.getAllPurchase
  );
router
  .route('/onepurchasing/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    getItemController.getPurchase
  );
router
  .route('/updateonepurchasing/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    getItemController.updatePurchase
  );
router
  .route('/deletepurchasing/:id')
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    getItemController.deletePurchase
  );

module.exports = router;
