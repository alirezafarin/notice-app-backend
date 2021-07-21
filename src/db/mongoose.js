const mongoose = require('mongoose');

mongoose.connect(process.env.connectionUrl + '/' + process.env.databaseName, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  autoIndex: true, //make this also true
});