const mongoose = require("mongoose");
const validator = require('validator');

const { Schema } = mongoose;

const noticeSchema = new Schema({
  name: {
    type: String,
    required: [true, 'لطفا نام آگهی خود را وارد کنید.'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'لطفا توضیحات آگهی خود را وارد کنید.'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'لطفا آدرس خود را وارد کنید.'],
    trim: true 
  },
  location: {
    type: [{
      type: String
    }],
    required: [true, 'لطفا لوکیشن خود را وارد کنید.'],
  },
  phoneNumber: {
    type: String,
    trim: true
  },
  imageName: {
    type: String,
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  }
}, {
  timestamps: true
})

const Notice = mongoose.model('Notice', noticeSchema);

module.exports = Notice;

