const superagent = require('superagent');
const User = require('../models/userModel');
const IDAnalyzer = require('idanalyzer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandler');
const cloudinary = require('../utils/cloudinary');
const sendEmail = require('../utils/email');
const Item = require('../models/itemModel');
const Post = require('../models/postModel');
const Donation = require('../models/donationModel');
const Request = require('../models/requestModel');

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

  const filterObject = currentObj(
    req.body,
    'name',
    'email',
    'mobnumber',
    'address',
    'city'
  );

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

exports.needyselfVerify = catchAsync(async (req, res, next) => {
  const needy = await User.findById(req.user.id);

  if (!needy) {
    return next(new AppError('No User found with the given ID', 400));
  }
  // console.log(req.file.filename);

  if (!req.file.filename) {
    return next(new AppError('Picture not upload Please re-upload it!', 400));
  }

  const cnic = await superagent.get(
    `http://api.qrserver.com/v1/read-qr-code/?fileurl=${req.file.filename}`
  );

  // console.log(cnic.text[57]);

  const arr = cnic.text;

  const result = arr.slice(57, 70);

  if (result.includes('download err')) {
    return next(
      new AppError('File is too Big, reduce file size to max 1mb!', 404)
    );
  }
  if (result.includes('could not')) {
    return next(
      new AppError(
        'Your Card Picture does not have QR code on it or the Code is not clear, Please take clear picture of your card back!',
        404
      )
    );
  }

  const cmpcnic = result * 1;
  // console.log(cmpcnic);
  // console.log(needy.cnic);
  if (cmpcnic !== needy.cnic)
    return next(
      new AppError('Invalid or not your Card, Please use yours!', 404)
    );

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

exports.needyselfVerifyadvance = catchAsync(async (req, res, next) => {
  const needy = await User.findById(req.user.id);

  if (!needy) {
    return next(new AppError('No User found with the given ID', 400));
  }
  // console.log(req.file.filename);

  if (!req.file.filename) {
    return next(new AppError('Picture not upload Please re-upload it!', 400));
  }

  let CoreAPI = new IDAnalyzer.CoreAPI(process.env.IDANALYZER_KEY, 'EU');

  CoreAPI.enableAuthentication(true, 2);
  CoreAPI.enableVault(false, false, false, false); // enable vault cloud storage to store document information and image
  /*

CoreAPI.setBiometricThreshold(0.6); // make face verification more strict  
CoreAPI.enableAuthentication(true, 'quick'); // check if document is real using 'quick' module  
CoreAPI.enableBarcodeMode(false); // disable OCR and scan for AAMVA barcodes only  
CoreAPI.enableImageOutput(true,true,"url"); // output cropped document and face region in URL format  
CoreAPI.enableDualsideCheck(true); // check if data on front and back of ID matches  
CoreAPI.setVaultData("user@example.com",12345,"AABBCC"); // store custom data into vault  
CoreAPI.restrictCountry("US,CA,AU"); // accept documents from United States, Canada and Australia  
CoreAPI.restrictState("CA,TX,WA"); // accept documents from california, texas and washington  
CoreAPI.restrictType("DI"); // accept only driver license and identification card  
CoreAPI.setOCRImageResize(0); // disable OCR resizing  
CoreAPI.verifyExpiry(true); // check document expiry  
CoreAPI.verifyAge("18-120"); // check if person is above 18  
CoreAPI.verifyDOB("1990/01/01"); // check if person's birthday is 1990/01/01  
CoreAPI.verifyDocumentNumber("X1234567"); // check if the person's ID number is X1234567  
CoreAPI.verifyName("Elon Musk"); // check if the person is named Elon Musk  
CoreAPI.verifyAddress("123 Sunny Rd, California"); // Check if address on ID matches with provided address  
CoreAPI.verifyPostcode("90001"); // check if postcode on ID matches with provided postcode
CoreAPI.enableAMLCheck(true); // enable AML/PEP compliance check
CoreAPI.setAMLDatabase("global_politicians,eu_meps,eu_cors"); // limit AML check to only PEPs
CoreAPI.enableAMLStrictMatch(true); // make AML matching more strict to prevent false positives
CoreAPI.generateContract("Template ID", "PDF", {"email":"user@example.com"}); // generate a PDF document autofilled with data from user ID
*/

  // const user = await User.findById(userId);

  // Analyze ID image by passing URL of the ID image (you may also use a local file)
  const response = await CoreAPI.scan({
    document_primary: req.file.filename,
    // biometric_photo: req.body.selfie,
  });
  if (!response.error) {
    console.log(response);

    const resultcnic = response.result.documentNumber.replace(/-/g, '');
    console.log(resultcnic);
    // All the information about this ID will be returned in an associative array
    let data_result = response['result'];
    let authentication_result = response['authentication'];
    let face_result = response['face'];

    // Print result
    console.log(
      `Hello your name is ${data_result['firstName']} ${data_result['lastName']}`
    );

    // Parse document authentication results
    if (authentication_result) {
      if (authentication_result['score'] > 0.5) {
        console.log('The document uploaded is authentic');
      } else if (authentication_result['score'] > 0.3) {
        console.log('The document uploaded looks little bit suspicious');
      } else {
        console.log('The document uploaded is fake');
      }
    }

    console.log('Auth Score: ' + authentication_result['score']);
    // Parse biometric verification results
    if (face_result) {
      if (face_result['isIdentical']) {
        console.log('Biometric verification PASSED!');
      } else {
        console.log('Biometric verification FAILED!');
      }
      console.log('Confidence Score: ' + face_result['confidence']);
    }

    // if (face_result["isIdentical"] && authentication_result["score"] > 0.5)
    if (authentication_result['score'] > 0.5) {
      const cmpcnic = resultcnic * 1;
      // console.log(cmpcnic);
      // console.log(needy.cnic);
      if (cmpcnic !== needy.cnic)
        return next(
          new AppError(
            'Not your Card, Please use yours that you used at time of sign up!',
            404
          )
        );

      needy.role = needy.temprole;
      needy.temprole = undefined;
      await needy.save({ validateBeforeSave: false });

      const message = `Your account has been verified! ${needy.name}. Now you can access all the features of POK. Your name on CNIC is ${data_result['firstName']} ${data_result['lastName']}`;

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
          new AppError(
            'There was error sending email please try again later!',
            500
          )
        );
      }

      // return res
      //   .status(200)
      //   .send(ResponseObject(200, true, `Verification Passed`, {}));
    } else {
      return res
        .status(400)
        .send(
          ResponseObject(
            400,
            false,
            `${
              authentication_result['score'] > 0.5
                ? 'Document Verification Passed'
                : authentication_result['score'] > 0.3
                ? 'The document uploaded looks little bit suspicious'
                : 'The document uploaded is fake'
            }`,
            {}
          )
        );
    }
  } else {
    // Error occurred
    console.log(response.error);
    return res.status(400).send({
      message: response.error,
      success: false,
      alert: 'Please Upload Valid Documents',
    });
  }
});

exports.GraphData = catchAsync(async (req, res, next) => {
  const year = '2023'; // Assuming the year is passed as a parameter

  const monthlyPostCounts = await Post.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' },
            ],
            default: 'Unknown',
          },
        },
        count: 1,
      },
    },
  ]);

  const monthlyRequestCounts = await Request.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' },
            ],
            default: 'Unknown',
          },
        },
        count: 1,
      },
    },
  ]);

  const monthlyItemsCounts = await Item.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' },
            ],
            default: 'Unknown',
          },
        },
        count: 1,
      },
    },
  ]);

  const monthlyDonationCounts = await Donation.aggregate([
    {
      $match: {
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', 1] }, then: 'Jan' },
              { case: { $eq: ['$_id', 2] }, then: 'Feb' },
              { case: { $eq: ['$_id', 3] }, then: 'Mar' },
              { case: { $eq: ['$_id', 4] }, then: 'Apr' },
              { case: { $eq: ['$_id', 5] }, then: 'May' },
              { case: { $eq: ['$_id', 6] }, then: 'Jun' },
              { case: { $eq: ['$_id', 7] }, then: 'Jul' },
              { case: { $eq: ['$_id', 8] }, then: 'Aug' },
              { case: { $eq: ['$_id', 9] }, then: 'Sep' },
              { case: { $eq: ['$_id', 10] }, then: 'Oct' },
              { case: { $eq: ['$_id', 11] }, then: 'Nov' },
              { case: { $eq: ['$_id', 12] }, then: 'Dec' },
            ],
            default: 'Unknown',
          },
        },
        count: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    monthlyPostCounts,
    monthlyRequestCounts,
    monthlyItemsCounts,
    monthlyDonationCounts,
  });
});
