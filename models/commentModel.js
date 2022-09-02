const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    comment: {
      type: String,
      required: [true, 'cannot be empty'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    post: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: [true, 'Must belong to Post'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Must be added by user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// commentSchema.index({ post: 1, user: 1 });

commentSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  this.populate({
    path: 'post',
    select: 'title -user',
  });
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
