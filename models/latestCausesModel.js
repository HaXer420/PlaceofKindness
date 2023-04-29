const mongoose = require('mongoose');
const slugify = require('slugify');

const causesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'must have a title'],
    },
    category: {
      type: String,
      required: [true, 'must have post detail'],
    },
    image: {
      type: String,
    },
    amount: Number,
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

causesSchema.pre('save', function (next) {
  this.slug = slugify(this.title, {
    lower: true,
  });
  next();
});

const Causes = mongoose.model('Causes', causesSchema);

module.exports = Causes;
