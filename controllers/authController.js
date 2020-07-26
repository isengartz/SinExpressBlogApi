const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const httpCodes = require('../utils/httpStatuses');
const sendEmail = require('../utils/email');

// Sign the JWT Token
const signToken = (id) => {
  return jwt.sign(
    {
      id: id,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  );
};

// Create and sign the JWT Token / Create a jwt cookie
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  // only set the SSL option if we are in production
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  // remove password from the user obj
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

// Signup / Generate Token
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // role: req.body.role,
  });
  createSendToken(newUser, httpCodes.HTTP_CREATED, res);
});

// Login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email password exists
  if (!email || !password) {
    return next(
      new AppError('Provide email and password', httpCodes.HTTP_BAD_REQUEST)
    );
  }
  // Check if user exists && password correct
  const user = await User.findOne({ email: email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(
      new AppError('Incorrect email or password', httpCodes.HTTP_UNAUTHORIZED)
    );
  }
  // Send token to client
  createSendToken(user, httpCodes.HTTP_OK, res);
});

// Middleware to restrict access to no login users
exports.protect = catchAsync(async (req, res, next) => {
  // Get token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not logged in', httpCodes.HTTP_UNAUTHORIZED)
    );
  }
  // Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError('User Token doesnt exists.', httpCodes.HTTP_UNAUTHORIZED)
    );
  }

  // Check if password changed after token issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        httpCodes.HTTP_UNAUTHORIZED
      )
    );
  }
  req.user = user;
  next();
});

// Middleware to restrict access only to given roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont you have access here', httpCodes.HTTP_FORBIDDEN)
      );
    }
    next();
  };
};
// Adds the user id to body payload
// Used for automatically add the logged in user when creating a blog or other resource
// Must be used with and after protect middleware
exports.addUserToBodyPayload = (req, res, next) => {
  if (!req.user) {
    return next(
      new AppError('You need to login first', httpCodes.HTTP_UNAUTHORIZED)
    );
  }
  req.body.user = req.user._id;
  next();
};

// Creates a reset token and send it via email to user
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user) {
    return next(
      new AppError('There is no user with that email', httpCodes.HTTP_NOT_FOUND)
    );
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Reset (Valid for 10 mins)`,
      message: message,
    });

    res.status(httpCodes.HTTP_OK).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (e) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email'),
      httpCodes.HTTP_INTERNAL_SERVER_ERROR
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // find user by token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: {
      $gt: Date.now(),
    },
  });

  // Update password if token is not expired and there is a user
  if (!user) {
    return next(
      new AppError('Cant find user or token expired'),
      httpCodes.HTTP_BAD_REQUEST
    );
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.save();

  // Update changedPassword
  // Send JWT
  createSendToken(user, httpCodes.HTTP_OK, res);
});

// Update user's password
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  // Check if Posted password is correct
  if (!(await user.correctPassword(req.body.password, user.password))) {
    return next(
      new AppError(
        'Current password isnt valid you prick',
        httpCodes.HTTP_UNAUTHORIZED
      )
    );
  }
  // Update password
  user.password = req.body.newPassword;
  await user.save({ validateBeforeSave: false });

  // Send JWT
  createSendToken(user, httpCodes.HTTP_OK, res);
});
