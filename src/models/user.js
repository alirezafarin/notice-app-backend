const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Schema } = mongoose;
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'لطفا نام خود را وارد کنید.']
  },
  lastName: {
    type: String,
    required: [true, 'لطفا نام خانوادگی خود را وارد کنید.']
  },
  phoneNumber: {
    type: String,
    required: [true, 'لطفا شماره موبایل خود را وارد کنید.'],
    trim: true,
    async validate(value) {
      if( !validator.isMobilePhone(value, ['fa-IR']) ){
        throw new Error('شماره موبایل وارد شده صحیح نیست.')
      }
      let user = await User.find({ phoneNumber: value });
      if( user.length > 0 ){
        throw new Error('شماره موبایل وارد شده قبلا گرفته شده است');
      }
    }
  },
  password: {
    type: String,
    required: [true, 'لطفا یک رمز عبور برای خود انتخاب کنید.'],
    trim: true,
    minLength: [6, 'پسورد باید حداقل ۶ کاراکتر باشد']
  },
  tokens: [{
    token: { type: String, required: true }
  }]
})

// to json
userSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;

  return userObject;
}


// static methods
userSchema.statics.findUserToLogin = async(phoneNumber, password) => {
  const user = await User.findOne({ phoneNumber });
  if( !user ) {
    throw new Error('کاربر پیدا نشد.');
  }

  let isMatch = await bcrypt.compare(password, user.password);
  if( !isMatch ) {
    throw new Error('رمز عبور وارد شده صحیح نیست.')
  }

  return user;
}

// instance methods
userSchema.methods.generateToken = async function() {
  let user = this;
  const token = jwt.sign(
                { _id: user._id.toString() },
                process.env.jwtRandomString);

  user.tokens = user.tokens.concat({ token });
  await user.save({ validateBeforeSave: false });
  
  return token;
}

userSchema.methods.removeToken = async function(tokenToDelete='') {
  let user = this;
  user.tokens = user.tokens.filter((userToken) => tokenToDelete !== userToken.token);
  await user.save({ validateBeforeSave: false });
}

// hashing password before saving it
userSchema.pre('save', async function(next) {
  let user = this;
  if(user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;