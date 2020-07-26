const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    validate: {
      validator: validator.isEmail,
      message: 'Provide a valid Email',
    },
    unique: [true, 'Email already in use. Use a different one.'],
    required: [true, 'Email is required'],
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password confirm is required'],
    validate: {
      // This only works on save and create not update
      validator: function (val) {
        return val === this.password;
      },
      message: 'Passwords doesnt match',
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash the password if password changed
userSchema.pre('save', async function (next) {
  // Only hash if the password changed
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  // Dont persist passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// If updated password add the passwordChangedAt field too
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next();
  }
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Compare if the given password is the same with
// The password currently saved in Database
userSchema.methods.correctPassword = async function (
  userGivenPassword,
  userCurrentPassword
) {
  return await bcrypt.compare(userGivenPassword, userCurrentPassword);
};

// Checks if a password was changed after a given timestamp
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  // False means NOT changed
  return false;
};

// Creates and persist the passwordResetToken and passwordResetExpires
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
