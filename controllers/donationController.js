const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.Top3Don = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: {
        role: {
          $eq: 'donator',
        },
      },
    },
    {
      $group: {
        _id: '$name',
        name1: { $push: '$photo' },
        donated: { $max: '$donated' },
      },
    },
    {
      $sort: {
        donated: -1,
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        photo: '$name1',
      },
    },

    { $limit: 3 },
  ]);

  res.status(200).json({
    users,
  });
});

exports.Top5Don = catchAsync(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: {
        role: {
          $eq: 'donator',
        },
      },
    },
    {
      $group: {
        _id: '$name',
        name1: { $push: '$photo' },
        donated: { $max: '$donated' },
      },
    },
    {
      $project: {
        _id: 0,
        Name: '$_id',
        photo: '$name1',
        donated: 1,
      },
    },
    {
      $sort: {
        donated: -1,
      },
    },
    { $limit: 5 },
  ]);

  res.status(200).json({
    users,
  });
});
