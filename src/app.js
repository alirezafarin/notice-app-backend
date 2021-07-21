const express = require('express');
const userRouter = require('./routes/user');
const noticeRouter = require('./routes/notice');
const path = require('path');
require('./db/mongoose');

const app = express();
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.json());
app.use(express.static(publicDirectoryPath));
app.use(userRouter);
app.use(noticeRouter);

module.exports = app;

