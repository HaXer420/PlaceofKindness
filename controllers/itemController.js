const Item = require('../models/itemModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.setItemUser = catchAsync(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;
  next();
});

exports.createItem = factory.createOne(Item);
exports.getAllItem = factory.getAll(Item);
exports.getItem = factory.getOne(Item);
exports.deleteItem = factory.deleteOne(Item);
exports.updateItem = factory.updateOne(Item);
