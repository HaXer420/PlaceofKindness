const Gallery = require('../models/galleryModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const AppError = require('../utils/appError');

exports.SetPhotoandUser = catchAsync(async (req, res, next) => {
  req.body.user = req.user.id;
  if (!req.file.filename)
    return next(new AppError('Image not found please upload again', 404));
  req.body.photo = req.file.filename;
  next();
});

exports.featuredImgs = catchAsync(async (req, res, next) => {
  const photos = await Gallery.aggregate([
    {
      $match: { featured: true },
    },
  ]);

  res.status(200).json({
    status: 'success',
    photos: photos,
  });
});

exports.updatePhoto = factory.updateOne(Gallery);
exports.getAllphotos = factory.getAll(Gallery);
exports.createPhoto = factory.createOne(Gallery);
exports.deletePhoto = factory.deleteOne(Gallery);
exports.getOnePhoto = factory.getOne(Gallery);
