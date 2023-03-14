const mongoose = require('mongoose');

const getItemSchema = mongoose.Schema(
  {
    shipaddress: {
      type: String,
      required: [true, 'Must have shipping address'],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    item: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'Item',
        required: [true, 'must belong to item'],
      },
    ],
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Must be taken by Needy'],
      },
    ],
    shipped: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

getItemSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  this.populate({
    path: 'item',
    select: 'name photo category',
  });
  next();
});

const getItem = mongoose.model('getItem', getItemSchema);

module.exports = getItem;
