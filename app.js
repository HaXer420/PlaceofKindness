const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');

const userRouter = require('./routes/userRoute');
const itemRouter = require('./routes/itemRoute');
const getitemRouter = require('./routes/needyItemRoute');
const galleryRouter = require('./routes/galleryRoute');
const commentRouter = require('./routes/commentRoute');
const requestRouter = require('./routes/requestRoute');
const postRouter = require('./routes/postRoute');
const contactRouter = require('./routes/contactRoute');
const donationRouter = require('./routes/donationRoute');
const causesRouter = require('./routes/causesRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.use(cors());

app.options('*', cors());

app.use(express.json());

app.use((req, res, next) => {
  req.requestBody = new Date().toISOString();
  next();
});

////////////////////////////////////////
//// Cron Job Functions.
require('./controllers/cronjobsHandler');

////////////////////////
// Routes
app.use('/', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/posts', postRouter);
app.use('/api/v1/donations', donationRouter);
app.use('/api/v1/needyitem', getitemRouter);
app.use('/api/v1/request', requestRouter);
app.use('/api/v1/gallery', galleryRouter);
app.use('/api/v1/contact', contactRouter);
app.use('/api/v1/causes', causesRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Couldn't fint the ${req.originalUrl} url`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
