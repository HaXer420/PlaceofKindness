const Request = require('../models/requestModel');
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

exports.getAllRequests = factory.getAll(Request);
exports.updateRequest = factory.updateOne(Request);
exports.OneRequest = factory.getOne(Request);
exports.deleteRequest = factory.deleteOne(Request);
