const express = require('express');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// Import Models
const User = require('../models/User');

/* Handler function to wrap each function with try/cath block */
const asycnHandler = cb => {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).send(error);
    }
  };
};

/* Authentication middleware */
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  // If email and password is provided...
  if (credentials && credentials.name && credentials.pass) {
    const user = await User.findOne({ emailAddress: credentials.name });
    // If the email provided is found in the database...
    if (user) {
      const authenticated = bcryptjs.compareSync(credentials.pass, user.password);
      // If the password provided is a match...
      if (authenticated) {
        console.log(`Authentication successful for email: ${user.emailAddress}`);
        req.currentUser = user;
      } else {
        message = `Invalid email and/or password`;
      }
    } else {
      message = `Invalid email and/or password`;
    }
  } else {
    message = 'Please enter your email and/or password';
  }

  if (message) {
    console.warn(message);
    res.status(401).json({ message });
  } else {
    next();
  }
};

/**
 * @listens   GET api/users
 * @desc      Currently Authenticated User
 * @access    Private
 */
router.get(
  '/',
  authenticateUser,
  asycnHandler(async (req, res, next) => {
    const { id, firstName, lastName, emailAddress } = req.currentUser;
    res.json({ id, firstName, lastName, emailAddress });
  })
);

/**
 * @listens   Post api/users
 * @desc      Create A User
 * @access    Private
 */
router.post(
  '/',
  [
    check('firstName')
      .exists()
      .withMessage('"firstName" is required')
      .notEmpty()
      .withMessage('Please enter your First Name'),
    check('lastName')
      .exists()
      .withMessage('"lastName" is required')
      .notEmpty()
      .withMessage('Please enter your Last Name'),
    check('emailAddress')
      .exists()
      .withMessage('"emailAddress" is required')
      .isEmail()
      .withMessage('Please Provide a valid Email Address'),
    check('password')
      .exists()
      .withMessage('"password" is required')
      .isLength({ min: 8, max: 20 })
      .withMessage('Password length should be between 8 - 20 characters'),
    check('confirmPassword', 'Passwords do not match').custom(
      (value, { req }) => value === req.body.password
    ),
  ],
  asycnHandler(async (req, res) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Iterate through the errors and get the error messages.
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      // Make sure the input email doesn't match an existing email address
      const existingUser = await User.find({ emailAddress: req.body.emailAddress.toLowerCase() });

      // If the email provided is new...
      if (existingUser.length < 1) {
        const user = await req.body;
        user.password = bcryptjs.hashSync(user.password);
        user.emailAddress = user.emailAddress.toLowerCase();
        User.create(user).then(() =>
          res
            .status(201)
            .end()
            .setHeader('Location', '/')
        );
      } else {
        res.status(400).json({ message: 'User already exists' });
      }
    }
  })
);

module.exports = router;
