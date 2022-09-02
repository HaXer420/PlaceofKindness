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
      data: {
        doc,
      },
    });
  }
});

exports.getAllPurchase = factory.getAll(getItem);
exports.getPurchase = factory.getOne(getItem);
exports.deletePurchase = factory.deleteOne(getItem);
exports.updatePurchase = factory.updateOne(getItem);
