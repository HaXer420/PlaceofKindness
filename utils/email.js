const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  // create transporter
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOSTNAME,
    // port: process.env.EMAIL_PORT,
    //auth: {
      //user: process.env.EMAIL_USERNAME,
      //pass: process.env.EMAIL_PASSWORD,
    //},

service: 'gmail',
    secure: false,
    auth: {
      user: 'mindcrackerjigar@gmail.com',
      pass: 'mkuopxpmhsbhoqsy',
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // mail options
  const mailOptions = {
    from: 'POC <placeofkindness@pok.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // send the mail

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;
