const getItem = require('../models/needyItemModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const AppError = require('../utils/appError');
const Item = require('../models/itemModel');

exports.createGetItem = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  if (!req.body.item) req.body.item = req.params.itemid;

  const item = await Item.findById(req.params.itemid);

  if (item.available === false || item.given === true) {
    next(new AppError('Item is not available ', 404));
  } else {
    const doc = await getItem.create(req.body);

    item.given = true;
    await item.save({ validateBeforeSave: false });

    res.status(201).json({
      status: 'success',
      message: 'Item will be sent to your given address shortly',
      data: doc,
    });
  }
});

exports.getAllPurchase = factory.getAll(getItem);
exports.getPurchase = factory.getOne(getItem);
exports.deletePurchase = factory.deleteOne(getItem);
exports.updatePurchase = factory.updateOne(getItem);

exports.unsentItems = catchAsync(async (req, res, next) => {
  const purchase = await getItem.aggregate([
    {
      $match: { shipped: false },
    },
  ]);
  res.status(201).json({
    status: 'success',
    total: purchase.length,
    data: purchase,
  });
});

exports.needyunsentItems = catchAsync(async (req, res, next) => {
  // const needyItem = await getItem.aggregate([
  //   {
  //     $match: { shipped: false, user: { $in: [req.params.id] } },
  //   },
  // ]);

  const needyItem = await getItem.find({
    user: { $in: [req.user.id] },
    shipped: false,
  });

  res.status(200).json({
    status: 'success',
    total: needyItem.length,
    data: needyItem,
  });
});

exports.needysentItems = catchAsync(async (req, res, next) => {
  const needyItem = await getItem.find({
    user: { $in: [req.user.id] },
    shipped: true,
  });

  res.status(200).json({
    status: 'success',
    total: needyItem.length,
    data: needyItem,
  });
});

exports.itemshippedtoneedy = catchAsync(async (req, res, next) => {
  const getitem = await getItem.findById(req.params.id);

  if (!getitem) {
    return next(new AppError('No Purchasing found with the given ID', 400));
  }

  getitem.shipped = true;
  await getitem.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: 'Item Successfully Shipped to the Requested Person',
  });
});
