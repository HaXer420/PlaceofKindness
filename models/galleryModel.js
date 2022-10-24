const mongoose = require('mongoose');

const gallerySchema = mongoose.Schema({
  photo: {
    type: String,
    default: 'default.jpg',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  featured: {
    type: Boolean,
    default: false,
  },
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Item must belong to User!'],
    },
  ],
});

gallerySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Gallery = mongoose.model('Gallery', gallerySchema);

module.exports = Gallery;
