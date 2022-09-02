const Post = require('../models/postModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');
const comments = require('../models/commentModel');

exports.setPostUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'comments',
    select: '_id -post -user',
  });
  if (!post) {
    return next(new AppError('Post not found with the given Id', 404));
  }

  const commentpost = await comments.deleteMany({
    post: { $in: [req.params.id] },
  });
  // console.log(commentpost);
  // let post1 = post.comments;
  const doc = await Post.findByIdAndDelete(req.params.id);
  // const commentonly = post.comments;
  // const comment = await comments.find(post.comments);
  // post1.map((item) => {
  //   console.log(item.id);
  // });

  res.status(204).json({
    status: 'success',
    data: null,
  });
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
// exports.deletePost = factory.deleteOne(Post);
exports.updatePost = factory.updateOne(Post);
