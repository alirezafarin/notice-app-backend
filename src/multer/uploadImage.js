const multer = require('multer');
const path = require('path');
const Notice = require('../models/notice');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)) //Appending extension
  }
})

const ImageUpload = multer({
  storage,
  limits: {
    fileSize: 1000000
  },
  async fileFilter(req, file, cb){
    // check if notice exists
    const notice = await Notice.findOne({ _id: req.params.id, owner: req.user._id });
    if( !notice ) {
      return cb(new Error('فایل پیدا نشد'))
    }
    // check file format
    const fileName = file.originalname;
    if(fileName.endsWith('jpg')
    || fileName.endsWith('jpeg')
    || fileName.endsWith('png')) {
      return cb(undefined, true);
    }

    cb(new Error('file format not accepted'))
  }
})

module.exports = ImageUpload;