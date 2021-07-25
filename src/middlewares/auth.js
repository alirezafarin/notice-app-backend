const jwt = require('jsonwebtoken');
const { sendError } = require('../globalVariables/functions');
const User = require('../models/user');

const extractTokenFromHeader = (req={}) => {
  return req.header('Authorization').replace('Bearer ', '');
}

const getUserFromToken = async(token='') => {
  const userData = jwt.verify(token, process.env.jwtRandomString);
  const user = await User.findOne({ _id: userData._id, 'tokens.token': token });
  return user;
}

const removeExpiredToken = async(req={}) => {
  try {
    const token = extractTokenFromHeader(req);
    const user = await User.findOne({ 'tokens.token': token });
    if( !user ) {
      return;
    }
    await user.removeToken(token);
  } catch (error) {
    console.log(error);    
  }
}

const auth = async(req, res, next) => {
  try {
    const token = extractTokenFromHeader(req);
    const user = await getUserFromToken(token);
    if( !user ) {
      throw new Error('ابتدا باید وارد شوید');
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    let errorMessage = {};
    let status = 401;
    if( error.name === 'TokenExpiredError' ){
      await removeExpiredToken(req);
      errorMessage = { message: 'توکن شما منقضی شده است' };
    }
    else {
      errorMessage = { message: 'باید ابتدا وارد شوید' };
    }
    sendError(res, errorMessage, status);
  }
}

module.exports = { auth, extractTokenFromHeader, getUserFromToken };