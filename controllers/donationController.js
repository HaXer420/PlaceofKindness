const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findById(req.params.tourId);
  //   console.log(tour);
  const amount = req.params.amount / 219;

  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/donations/my-donations/?user=${req.user.id}&${amount},`,
    cancel_url: `${req.protocol}://${req.get('host')}/posts/,`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,

    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${req.user.name} Thanks alot for your support.`,
            images: [
              `https://cdn1.sportngin.com/attachments/photo/9a9e-112034417/donate-button_large.jpg`,
            ],
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    data: {
      session,
    },
  });
});

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
