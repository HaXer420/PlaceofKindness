const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const User = require('../models/userModel');
const Donation = require('../models/donationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./factoryHandler');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });

  if (!user) {
    return next(new AppError('Email not found Please enter a valid one!'));
  }
  //generate reset token
  const transactionToken = user.TransConfirmToken();
  await user.save({ validateBeforeSave: false });

  const amount = req.params.amount * 1;

  console.log('hhhui', transactionToken);

  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // success_url: `${req.protocol}://${req.get(
    //   'host'
    // )}/api/v1/donations/create-donations/?usertoken=${transactionToken}&amount=${amount}`,
    success_url: `http://localhost:3000/paymentsuccessful?usertoken=${transactionToken}&amount=${amount}`,
    cancel_url: `http://localhost:3000/donatemoney`,
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
  const { usertoken, amount } = req.query;
  const pkr = amount * 1;

  console.log('token..', usertoken);

  const hashedToken = crypto
    .createHash('sha256')
    .update(usertoken)
    .digest('hex');

  if (!usertoken && !amount) return next();

  const user1 = await User.findOne({
    tranConfirmToken: hashedToken,
  });

  if (!user1)
    return next(
      new AppError('User not found or already made transaction', 400)
    );

  const userid = user1.id;

  // console.log(userid);

  await Donation.create({ user: userid, amount });

  if (!user1) {
    return next(new AppError('No User found', 400));
  }

  user1.donated += pkr;
  user1.tranConfirmToken = undefined;
  await user1.save({ validateBeforeSave: false });

  // res.redirect(req.originalUrl.split('?')[0]);

  next();
});

exports.getMyDonations = catchAsync(async (req, res, next) => {
  const donation = await Donation.find({ user: req.user.id });

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

exports.getAllDonation = factory.getAll(Donation);
exports.getDonation = factory.getOne(Donation);
exports.updateDonation = factory.updateOne(Donation);
exports.deleteDonation = factory.deleteOne(Donation);
