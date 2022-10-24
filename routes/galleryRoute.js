const express = require('express');
const galleryController = require('../controllers/galleryController');
const authController = require('../controllers/authController');
const multer = require('../utils/multer');

const router = express.Router();

router.route('/allphotos').get(galleryController.getAllphotos);

router
  .route('/uploadphoto')
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    multer.uploadUserImg,
    multer.UserImgResize,
    galleryController.SetPhotoandUser,
    galleryController.createPhoto
  );

router.get('/featuredimgs', galleryController.featuredImgs);

router
  .route('/:id')
  .get(galleryController.getOnePhoto)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    galleryController.updatePhoto
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    galleryController.deletePhoto
  );

module.exports = router;
