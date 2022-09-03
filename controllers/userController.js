const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const cloudinary = require('../utils/cloudinary');
const sendEmail = require('../utils/email');

// multer

// exports.getAllUsers = (req, res, next) => {};
const currentObj = (obj, ...fieldsallowed) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (fieldsallowed.includes(el)) newObj[el] = obj[el];
  });

  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update please use update password route for that!',
        400
      )
    );
  }

  const filterObject = currentObj(req.body, 'name', 'email');

  if (req.file) filterObject.photo = req.file.filename;

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: updatedUser,
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  const userD = await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.needyUsers = catchAsync(async (req, res, next) => {
  const user = await User.find({ role: 'needy' }).select(
    '-__v -passwordChangedAt -active -donated'
  );
  res.status(200).json({
    status: 'success',
    result: user.length,
    data: user,
  });
});

const getOneUser = (Model, popOpt, popOpt2, popOpt3) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (popOpt) {
      query = query.populate(popOpt);
    }

    if (popOpt2) {
      query = query.populate(popOpt2);
    }

    if (popOpt3) {
      query = query.populate(popOpt3);
    }

    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate('reviews');

    if (!doc) {
      // return res.status(404).json('id not found');
      return next(new AppError('No doc found with such id'));
    }

    res.status(200).json({
      status: 'success',
      posts: doc.posts.length,
      items: doc.items.length,
      requests: doc.requests.length,
      data: doc,
    });
  });

exports.getUser = getOneUser(
  User,
  { path: 'posts' },
  { path: 'items' },
  { path: 'requests' }
);
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.UnverifiedNeedy = catchAsync(async (req, res, next) => {
  const user = await User.aggregate([
    {
      $match: { role: 'unverified', temprole: 'needy' },
    },
  ]);

  res.status(200).json({
    status: 'success',
    result: user.length,
    data: user,
  });
});

exports.needyVerify = catchAsync(async (req, res, next) => {
  const needy = await User.findById(req.params.id);

  if (!needy) {
    return next(new AppError('No User found with the given ID', 400));
  }

  needy.role = needy.temprole;
  needy.temprole = undefined;
  await needy.save({ validateBeforeSave: false });

  const message = `Your account has been verified! ${needy.name}. Now you can access all the features of POK.`;

  try {
    await sendEmail({
      email: needy.email,
      subject: 'Your Account Verified!',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Needy Verified!',
    });
  } catch (err) {
    return next(
      new AppError('There was error sending email please try again later!', 500)
    );
  }
});
