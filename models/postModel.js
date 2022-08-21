const mongoose = require('mongoose');
const slugify = require('slugify');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'must have a title'],
    },
    description: {
      type: String,
      required: [true, 'must have post detail'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    slug: {
      type: String,
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Post must belong to user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual('comments', {
  ref: 'Comment',
  foreignField: 'post',
  localField: '_id',
});

postSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

postSchema.pre('save', function (next) {
  this.slug = slugify(this.title, {
    lower: true,
  });
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
