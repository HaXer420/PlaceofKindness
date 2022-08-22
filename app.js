const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');

const userRouter = require('./routes/userRoute');
const itemRouter = require('./routes/itemRoute');
const commentRouter = require('./routes/commentRoute');
const postRouter = require('./routes/postRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

dotenv.config({ path: './config.env' });

const app = express();

app.use(cors());

app.options('*', cors());

app.use(express.json());

app.use((req, res, next) => {
  req.requestBody = new Date().toISOString();
  next();
});

app.use('/', postRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/posts', postRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Couldn't fint the ${req.originalUrl} url`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
