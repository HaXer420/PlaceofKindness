const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Must Belong to donator'],
  },
  amount: {
    type: Number,
    required: [true, 'Donation Must have a price'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

donationSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

const Donation = mongoose.model('Donations', donationSchema);

module.exports = Donation;
