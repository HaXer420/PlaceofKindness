const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.requestBody = new Date().toISOString();
  next();
});

app.use('/', (req, res) => {
  res.send('Hii');
});

module.exports = app;
