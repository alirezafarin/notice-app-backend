const express = require('express');
const { sendError, sendResponse } = require('../globalVariables/functions');
const auth = require('../middlewares/auth');
const User = require('../models/user');

const router = new express.Router();

router.post('/user/signIn', async(req, res) => {
  try {
    let user = new User(req.body);
    await user.save(); 
    sendResponse(res, 'حساب کاربری شما با موفقیت به وجود آمد.', {}, 
    201);
  } catch (error) {
    sendError(res, error);
  }
})

router.post('/user/login', async(req, res) => {
  try {
    const phoneNumber = req.body.phoneNumber;
    const password = req.body.password;
    const user = await User.findUserToLogin(phoneNumber, password);
    const token = await user.generateToken();
    sendResponse(res, 'با موفقیت وارد شدید.',
    {user, token}, 
    200);
  } catch (error) {
    sendError(res, error);
  }
})

router.get('/user/logout', auth, async(req, res) => {
  try {
    const user = req.user;
    await user.removeToken(req.token);
    sendResponse(res, 'با موفقیت خارج شدید.', {},
    200);
  } catch (error) {
    sendError(res, error);
  }
})

module.exports = router;