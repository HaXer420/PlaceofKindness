const Item = require('../models/itemModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const AppError = require('../utils/appError');

exports.setItemUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.setItemPhoto = catchAsync(async (req, res, next) => {
  req.body.photo = req.file.filename;
  next();
});

exports.createItem = factory.createOne(Item);
exports.getAllItem = factory.getAll(Item);
exports.getItem = factory.getOne(Item);
exports.deleteItem = factory.deleteOne(Item);
exports.updateItem = factory.updateOne(Item);

exports.unavailableItems = catchAsync(async (req, res, next) => {
  const item = await Item.aggregate([
    {
      $match: { available: false, given: false },
    },
  ]);

  res.status(201).json({
    status: 'success',
    total: item.length,
    data: item,
  });
});

exports.makeItemavailable = catchAsync(async (req, res, next) => {
  const item = await Item.findById(req.params.id);

  if (!item) {
    return next(new AppError('No Item found with the given ID', 400));
  }

  item.available = true;
  await item.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Item is Available now!',
  });
});
