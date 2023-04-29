const Causes = require('../models/latestCausesModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.setCreator = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  if (!req.file.filename)
    return next(new AppError('Image not found please upload again', 404));
  req.body.image = req.file.filename;

  next();
});

exports.createCauses = factory.createOne(Causes);
exports.updateCauses = factory.updateOne(Causes);
exports.getallCauses = factory.getAll(Causes);
exports.getOneCauses = factory.getOne(Causes);
exports.deleteCauses = factory.deleteOne(Causes);
