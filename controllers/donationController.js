const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.Top3Don1 = async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $sort: { Donation: 1 },
      },
      {
        $group: {
          _id: { $toUpper: '$id' },
          totalTours: { $sum: 1 },
          totalRatings: { $sum: '$ratingsQuantity' },
          avrgRating: { $avg: '$ratingsAverage' },
          avrgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          Donation: { $push: '$donated' },
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        tour: stats,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'failed',
      data: {
        tour: 'invalid data',
      },
    });
  }
};

exports.Top3Don2 = async (req, res) => {
  try {
    const plan = await User.aggregate([
      {
        $match: {
          role: {
            $eq: 'donator',
          },
        },
      },
      {
        $group: {
          _id: '$id',
          totalTours: { $sum: 1 },
          Donation: '$donated',
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $sort: {
          totalTours: 1,
        },
      },
      {
        $project: { _id: 1, name: 1 },
      },
      {
        $limit: 12,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        tour: plan,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: 'failed',
      data: {
        tour: 'invalid data',
      },
    });
  }
};

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
