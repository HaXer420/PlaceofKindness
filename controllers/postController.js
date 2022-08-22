const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.setPostUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

// exports.postDel = catchAsync(async (req, res, next) => {
//   const post = await Post.find({
//     $and: [{ id: req.params.id }, { user: req.user.id }],
//   });
//   console.log(post);
//   res.status(200).json({
//     status: 'success',
//     data: post,
//   });
// });

exports.createPost = factory.createOne(Post);
exports.getAllPost = factory.getAll(Post);
exports.getPost = factory.getOne(Post, { path: 'comments' });
exports.deletePost = factory.deleteOne(Post);
exports.updatePost = factory.updateOne(Post);
