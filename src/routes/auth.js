const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const User = require('../models/user');

const {
  getLogin,
  postLogin,
  postLogout,
  getSignUp,
  postSignUp,
  getReset,
  postReset,
  getNewPassword,
  postNewPassword,
} = require('../controllers/auth');

router.get('/login', getLogin);

// router.post('/login', postLogin);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be valid.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  postLogin
);

router.post('/logout', postLogout);

router.get('/signup', getSignUp);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email!')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject(
              'E-mail exist already, please pick a different one!'
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and atleast 5 and less than 30 characters.'
    )
      .trim()
      .isLength({ min: 5, max: 30 })
      .isAlphanumeric(),
    body('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      }),
  ],
  postSignUp
);

router.get('/reset', getReset);

router.post('/reset', postReset);

router.get('/reset/:token', getNewPassword);

router.post('/new-password', postNewPassword);

module.exports = router;
