const Comment = require('../models/commentModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.setPostUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.post) req.body.post = req.params.postid;
  next();
});

exports.createComment = factory.createOne(Comment);
exports.getAllComments = factory.getAll(Comment);
exports.getComment = factory.getOne(Comment);
exports.updateComment = factory.updateOne(Comment);
exports.deleteComment = factory.deleteOne(Comment);
