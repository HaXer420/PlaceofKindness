const mongoose = require('mongoose');
const slugify = require('slugify');

const requestSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'must have a title'],
    },
    amount: {
      type: Number,
    },
    description: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    paymentacc: {
      type: String,
      required: [true, 'must enter payment address'],
    },
    moneygot: {
      type: Number,
      default: 0,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
    },
    user: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Post must belong to needy user'],
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

requestSchema.virtual('FundsRemain').get(function () {
  const amount = this.amount - this.moneygot;
  if (amount <= 0) return 0;
  return amount;
});

requestSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

requestSchema.pre('save', function (next) {
  this.slug = slugify(this.title, {
    lower: true,
  });
  this.paymentacc = this.paymentacc.toUpperCase();
  next();
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;
