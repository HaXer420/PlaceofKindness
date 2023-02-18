const express = require('express');
const contactController = require('../controllers/contactController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/create', contactController.createContact);

router.get(
  '/all',
  authController.protect,
  authController.restrictTo('admin'),
  contactController.getContacts
);

router.get(
  '/:id',
  authController.protect,
  authController.restrictTo('admin'),
  contactController.getOneContact
);

router.patch(
  '/makeseen/:id',
  authController.protect,
  authController.restrictTo('admin'),
  contactController.makecontactseen
);

module.exports = router;
