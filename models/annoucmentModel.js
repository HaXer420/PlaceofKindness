const mongoose = require('mongoose');
const slugify = require('slugify');

const annoucmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'must have a title'],
    },
    description: {
      type: String,
      required: [true, 'must have descriptiont detail'],
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

annoucmentSchema.pre('save', function (next) {
  this.slug = slugify(this.title, {
    lower: true,
  });
  next();
});

const Annoucment = mongoose.model('Annoucment', annoucmentSchema);

module.exports = Annoucment;
