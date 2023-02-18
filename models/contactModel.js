const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Must have a name'],
  },
  description: {
    type: String,
    required: [true, 'Must enter description!'],
  },
  name: {
    type: String,
    required: [true, 'Must enter name'],
  },
  email: {
    type: String,
    required: [true, 'Must have a email'],
    lowercase: true,
    validate: [validator.isEmail, 'Enter valid email'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  seen: {
    type: Boolean,
    default: false,
  },
});

const Contact = mongoose.model('Contact', contactSchema);

module.exports = Contact;
