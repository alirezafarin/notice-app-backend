const express = require('express');
const multer = require('multer');
const path = require('path');
const { sendResponse, sendError } = require('../globalVariables/functions');
const auth = require('../middlewares/auth');
const Notice = require('../models/notice');

const router = new express.Router();

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
    const notice = await Notice.findOne({ _id: req.params.id});
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

router.post('/createNotice', auth, async(req, res) => {
  try {
    const notice = await new Notice({
      ...req.body,
      owner: req.user._id
    })
    const createdNotice = await notice.save();
    sendResponse(res, 'آگهی با موفقیت اضافه شد.', { id: createdNotice._id },
    201);
  } catch (error) {
    sendError(res, error);
  }
})

router.post('/notice/uploadImage/:id', auth, ImageUpload.single('image'), async(req, res) => {
  const imageName = `images/${req.file.filename}`;
  const notice = await Notice.findOne({ _id: req.params.id});
  if( !notice ) {
    return sendError(res, {
      message: 'عکس آپلود نشد'
    }, 404);
  }
  notice.imageName = imageName;
  await notice.save();
  sendResponse(res, 'عکس آپلود شد', {}, 
  200)
}, (error, req, res, next) => {
  sendError(res, error, 404);
})

module.exports = router;