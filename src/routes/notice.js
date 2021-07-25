const express = require('express');
const { sendResponse, sendError } = require('../globalVariables/functions');
const auth = require('../middlewares/auth');
const Notice = require('../models/notice');
const ImageUpload = require('../multer/uploadImage');

const router = new express.Router();

/////////////////////////////////////////////////////////////

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

/////////////////////////////////////////////////////////////

router.post('/notice/uploadImage/:id', auth, ImageUpload.single('image'), async(req, res) => {
  console.log(req, 'req');
  const imageName = `images/${req.file.filename}`;
  const notice = await Notice.findOne({ _id: req.params.id, owner: req.user._id });
  if( !notice ) {
    return sendError(res, {
      message: 'عکس آپلود نشد'
    }, 404);
  }
  // check if user is owner of notice
  if( !notice.owner.equals(req.user._id) ) {
    return sendError(res, {
      message: 'عکس آپلود نشد'
    }, 404);
  }
  notice.imageName = imageName;
  await notice.save();
  sendResponse(res, 'عکس آپلود شد', {imageName}, 
  200)
}, (error, req, res, next) => {
  sendError(res, error, 404);
})

/////////////////////////////////////////////////////////////

router.get('/getAllNotices', async(req, res) => {
  try {
    const notices = await Notice.find({});
    if( !notices ) {
      throw new Error('پیدا نشد');
    }
    sendResponse(res, '', notices,
    200);
  } catch (error) {
    sendError(res, error);
  }
})

/////////////////////////////////////////////////////////////

router.get('/getNoticeById', async(req, res) => {
  try {
    const notice = await Notice.findOne({ _id: req.query.id });
    if( !notice ) {
      throw new Error('پیدا نشد');
    }
    sendResponse(res, '', { ...notice._doc, _id: req.query.id },
    200);
  } catch (error) {
    sendError(res, error);
  }
})

/////////////////////////////////////////////////////////////

router.patch('/notice/:id', auth, async(req, res) => {

  let allowedUpdates = ['name', 'description', 'address', 'phoneNumber'];
  let inComingUpdates = Object.keys(req.body);
  inComingUpdates.forEach((updateKey) => {
    if(allowedUpdates.indexOf(updateKey) === -1) {
      return sendError(res, { message: 'این آپدیت امکان پذیر نیست' }
      , 405);
    }
  })

  try{
    const notice = await Notice.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, req.body);
    if( !notice ) {
      throw new Error('پیدا نشد');
    }

    const updatedNotice = await Notice.findOne({ _id: req.params.id, owner: req.user._id });
    sendResponse(res, '', updatedNotice, 200);
  }
  catch(e) {
    sendError(res, e, 400);
  }

});

/////////////////////////////////////////////////////////////

router.delete('/deleteNotice/:id', auth, async(req, res) => {
  try { 
    let notice = await Notice.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if( !notice ) {
      throw new Error('پیدا نشد');
    }
    sendResponse(res, 'با موفقیت حذف شد', {},
    200);
  } catch (error) {
    sendError(res, { message: 'آگهی پیدا نشد' });
  }
})

/////////////////////////////////////////////////////////////

module.exports = router;