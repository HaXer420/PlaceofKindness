const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const Request = require('../models/requestModel');
const Donation = require('../models/donationModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.createRequest = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  const user = await User.findById(req.user.id);

  if (user.requestlimit !== 0) {
    const request = await Request.create(req.body);

    user.requestlimit -= 1;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      messge: 'request Created',
      data: request,
    });
  } else {
    next(
      new AppError(
        'Your already sent this week requests please come back later to make new requests',
        404
      )
    );
  }
});

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.user.email });

  const request = await Request.findById(req.params.request);

  if (!request) {
    return next(new AppError('Request Post not found', 404));
  }

  if (request.paid === true || request.moneygot >= request.amount) {
    return next(new AppError('User already got the required amount'));
  }

  if (!user) {
    return next(new AppError('Email not found Please enter a valid one!'));
  }
  //generate reset token
  const transactionToken = user.TransConfirmToken();
  await user.save({ validateBeforeSave: false });

  const amount = req.params.amount * 1;

  // create stripe checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get(
      'host'
    )}/api/v1/request/create-donations/?usertoken=${transactionToken}&amount=${amount}&post=${
      req.params.request
    }`,
    // success_url: `http://localhost:3000/donatemoney/?usertoken=${transactionToken}&amount=${amount}`,
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
  const { usertoken, amount, post } = req.query;
  const pkr = amount * 1;

  const hashedToken = crypto
    .createHash('sha256')
    .update(usertoken)
    .digest('hex');

  if (!usertoken && !amount && !post) return next();

  const user1 = await User.findOne({
    tranConfirmToken: hashedToken,
  });

  if (!user1)
    return next(
      new AppError('User not found or already made transaction', 400)
    );

  const request = await Request.findById(post);

  if (!request) {
    return next(new AppError('Request Post is not found', 400));
  }

  const userid = user1.id;

  // console.log(userid);

  await Donation.create({ user: userid, amount });

  if (!user1) {
    return next(new AppError('No User found', 400));
  }

  user1.donated += pkr;
  user1.tranConfirmToken = undefined;
  await user1.save({ validateBeforeSave: false });

  request.moneygot += pkr;
  console.log(request, `amount :${amount}`);
  await request.save({ validateBeforeSave: false });

  if (request.moneygot >= request.amount) {
    request.paid = true;
    await request.save({ validateBeforeSave: false });
  }

  // res.redirect(req.originalUrl.split('?')[0]);

  next();
});

exports.getAllRequests = factory.getAll(Request);
exports.updateRequest = factory.updateOne(Request);
exports.OneRequest = factory.getOne(Request);
exports.deleteRequest = factory.deleteOne(Request);
