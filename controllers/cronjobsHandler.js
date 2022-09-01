const cron = require('node-cron');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');

cron.schedule(
  '10 10 10 * * 1',
  catchAsync(async () => {
    console.log('running every monday 10th hr,10th minute and 10th second');

    const user = await User.updateMany(
      { requestlimit: { $lt: 2 } },
      { requestlimit: 2 }
    );
  })
);

module.exports = cron;
