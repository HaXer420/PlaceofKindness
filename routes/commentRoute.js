const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('needy', 'donator'),
    commentController.setPostUser,
    commentController.createComment
  );

router.route('/').get(commentController.getAllComments);

router
  .route('/:id')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    commentController.getComment
  )
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    commentController.updateComment
  )
  .delete(authController.protect, commentController.deleteComment);

module.exports = router;
