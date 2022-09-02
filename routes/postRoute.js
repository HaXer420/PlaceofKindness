const express = require('express');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const commentRouter = require('./commentRoute');

const router = express.Router();

router.use('/:postid/comments', commentRouter);

router.route('/').get(postController.getAllPost);

router
  .route('/createPost')
  .post(
    authController.protect,
    postController.setPostUser,
    postController.createPost
  );

// router
//   .route('/deletepost/:id')
//   .delete(authController.protect, postController.postDel);

// router.route('/:id').get(postController.getPost);

router
  .route('/:id')
  .get(postController.getPost)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    postController.updatePost
  )
  .delete(authController.protect, postController.deletePost);

module.exports = router;
