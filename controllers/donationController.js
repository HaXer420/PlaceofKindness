const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/userModel');
const Donation = require('../models/donationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // const tour = await Tour.findById(req.params.tourId);
  //   console.log(tour);
  const amount = req.params.amount * 1;

  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/donations/create-donations/?user=${req.user.id}&amount=${amount}`,
    success_url: `http://localhost:3000/getUrl/?user=${req.user.id}&amount=${amount}`,
    cancel_url: `${req.protocol}://${req.get('host')}/posts/,`,
    customer_email: req.user.email,
    client_reference_id: req.user.id,

    line_items: [
      {
        price_data: {
          currency: 'pkr',
          product_data: {
            name: `${req.user.name} Thanks alot for your support.`,
            images: [
              `https://cdn1.sportngin.com/attachments/photo/9a9e-112034417/donate-button_large.jpg`,
            ],
          },
          unit_amount: req.params.amount * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
  });

  res.status(200).json({
    status: 'success',
    url: session.url,
    data: {
      session,
    },
  });
});

exports.createDonationCheckout = catchAsync(async (req, res, next) => {
  const { user, amount } = req.query;
  const pkr = amount * 1;

  if (!user && !amount) return next();

  await Donation.create({ user, amount });

  const user1 = await User.findById(user);

  if (!user1) {
    return next(new AppError('No User found', 400));
  }

  user1.donated += pkr;
  await user1.save({ validateBeforeSave: false });

  // res.redirect(req.originalUrl.split('?')[0]);

  next();
});

exports.getMyDonations = catchAsync(async (req, res, next) => {
  const donation = await Donation.find({ user: req.user.id });

  // const tourIDs = booking.map((el) => el.tour);
  // const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).json({
    status: 'success',
    result: donation.length,
    title: 'My Donations',
    donation,
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
