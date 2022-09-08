const mongoose = require('mongoose');
const slugify = require('slugify');

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'must have a name'],
    },
    photo: {
      type: String,
      required: true,
      default: 'defaultitem.jgp',
    },
    category: {
      type: String,
      enum: [
        'Clothing',
        'Shoes',
        'Electronics',
        'House Items',
        'Others',
        'Item',
      ],
      default: 'Item',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    given: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
    },
    available: {
      type: Boolean,
      default: false,
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Item must belong to donator'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

itemSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

itemSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
