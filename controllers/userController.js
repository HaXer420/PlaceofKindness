const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

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

  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterObject, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
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
    data: {
      body: user,
    },
  });
});

exports.getUser = factory.getOne(User, { path: 'posts' }, { path: 'items' });
exports.getAllUsers = factory.getAll(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
