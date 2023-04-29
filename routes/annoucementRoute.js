const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const AnnoucmentController = require('../controllers/annoucmentController');

const router = express.Router();

router.post(
  '/create',
  authController.protect,
  authController.restrictTo('admin'),
  AnnoucmentController.setCreator,
  AnnoucmentController.createAnnoucment
);

router.get('/getall', AnnoucmentController.getallAnnoucment);

router.get('/getone/:id', AnnoucmentController.getOneAnnoucment);

router.patch(
  '/update/:id',
  authController.protect,
  authController.restrictTo('admin'),
  AnnoucmentController.updateAnnoucment
);

router.delete(
  '/delete/:id',
  authController.protect,
  authController.restrictTo('admin'),
  AnnoucmentController.deleteAnnoucment
);

module.exports = router;
