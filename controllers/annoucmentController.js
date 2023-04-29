const Annoucment = require('../models/annoucmentModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');

exports.setCreator = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;

  next();
});

exports.createAnnoucment = factory.createOne(Annoucment);
exports.updateAnnoucment = factory.updateOne(Annoucment);
exports.getallAnnoucment = factory.getAll(Annoucment);
exports.getOneAnnoucment = factory.getOne(Annoucment);
exports.deleteAnnoucment = factory.deleteOne(Annoucment);
