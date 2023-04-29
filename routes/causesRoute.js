const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const causesController = require('../controllers/causeController');
const multer = require('../utils/multer');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('admin'),
  multer.uploadUserImg,
  multer.UserImgResize,
  causesController.setCreator,
  causesController.createCauses
);

router.get('/getall', causesController.getallCauses);

router.get('/getone/:id', causesController.getOneCauses);

router.patch(
  '/update/:id',
  authController.protect,
  authController.restrictTo('admin'),
  causesController.updateCauses
);

router.delete(
  '/delete/:id',
  authController.protect,
  authController.restrictTo('admin'),
  causesController.deleteCauses
);

module.exports = router;
