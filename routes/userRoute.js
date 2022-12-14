const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const multer = require('../utils/multer');
const aggregation = require('../controllers/factoryHandler');

const router = express.Router();

/////////////////
//// Aggregation Route for (Total: Donator,donations,items,needy)
router.get('/totaldata', aggregation.Aggregations);

router.route('/needyusers').get(userController.needyUsers);

router
  .route('/signup')
  .post(authController.signup, authController.sendEmailConfirm);

//needy
router.post('/signupneedy', authController.signupneedy);

router.patch('/emailConfirm/:token', authController.emailConfirm);
///////////////
/// needyselfverify

router.patch(
  '/selfverifyneedy',
  authController.protect,
  authController.restrictTo('unverified'),
  multer.uploadUserImg,
  multer.UserImgResize,
  userController.needyselfVerify
);

router.route('/login').post(authController.login);
router.route('/forgotpassword').post(authController.forgotPassword);
router.route('/resetpassword/:token').patch(authController.resetPassword);
router
  .route('/updatepassword')
  .patch(authController.protect, authController.updatePass);

router.patch(
  '/updateMe',
  authController.protect,
  multer.uploadUserImg,
  multer.UserImgResize,
  userController.updateMe
);

router
  .route('/getme')
  .get(authController.protect, userController.getMe, userController.getUser);

router.delete('/deleteMe', authController.protect, userController.deleteMe);

/////////////////////////////////////////////////////////////////
//admin

router.patch(
  '/needyverify/:id',
  authController.protect,
  authController.restrictTo('admin'),
  userController.needyVerify
);

router.get(
  '/',
  authController.protect,
  authController.restrictTo('admin'),
  userController.getAllUsers
);

router
  .route('/unverifiedneedy')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.UnverifiedNeedy
  );

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getUser
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    userController.updateUser
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    userController.deleteUser
  );

module.exports = router;
