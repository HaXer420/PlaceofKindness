const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Must have a name'],
  },
  email: {
    type: String,
    required: [true, 'Must have a email'],
    lowercase: true,
    validate: [validator.isEmail, 'Enter valid email'],
  },
  message: {
    type: String,
    required: [true, 'Must enter message!'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  attachments: String,
  reply: [
    {
      message: { type: String },
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
