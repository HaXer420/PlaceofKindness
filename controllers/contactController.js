const Contact = require('../models/contactModel');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./factoryHandler');

exports.createContact = Factory.createOne(Contact);

exports.getContacts = Factory.getAll(Contact);

exports.makecontactseen = catchAsync(async (req, res, next) => {
  req.body.seen = true;
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'Success',
    contact,
  });
});

exports.getOneContact = Factory.getOne(Contact);
