const express = require('express');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const router = express.Router();

// Import Models
const Course = require('../models/Course');
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
 * @listens   GET api/courses
 * @desc      Get All Courses
 * @access    Public
 */
router.get(
  '/',
  asycnHandler(async (req, res) => {
    Course.find()
      // Sorts by date in descending order (most recent first)
      .sort({ updatedAt: -1 })
      .then(courses => res.json(courses))
      .catch(err => console.log(err));
  })
);

/**
 * @listens   GET api/courses/:id
 * @desc      Get An Individual Course
 * @access    Public
 */
router.get(
  '/:id',
  asycnHandler(async (req, res) => {
    Course.findById(req.params.id)
      .then(course => res.json(course))
      .catch(() => res.status(404).json({ message: 'Course Not Found!' }));
  })
);

/**
 * @listens   Post api/courses
 * @desc      Create A Course
 * @access    Private
 */
router.post(
  '/',
  authenticateUser,
  [
    check('title')
      .exists()
      .withMessage('"title" is required')
      .notEmpty()
      .withMessage('Please enter a "title"'),
    check('description')
      .exists()
      .withMessage('"description" is required')
      .notEmpty()
      .withMessage('Please enter a "description"'),
  ],
  asycnHandler(async (req, res) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Iterate through the errors and get the error messages.
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      const course = await req.body;
      // the 'userId' for the course comes from currently authenticated user
      course.user = req.currentUser;
      Course.create(req.body).then(course =>
        res
          .status(201)
          .json({ courseId: course._id })
          .setHeader('Location', `/api/course/${course._id}`)
      );
    }
  })
);

/**
 * @listens   PUT api/courses/:id
 * @desc      Update A Course
 * @access    Private
 */
router.put(
  '/:id',
  authenticateUser,
  [
    check('title')
      .exists()
      .withMessage('"title" is required')
      .notEmpty()
      .withMessage('Please enter a "title"'),
    check('description')
      .exists()
      .withMessage('"description" is required')
      .notEmpty()
      .withMessage('Please enter a "description"'),
  ],
  asycnHandler(async (req, res) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Iterate through the errors and get the error messages.
      const errorMessages = errors.array().map(error => error.msg);
      res.status(400).json({ errors: errorMessages });
    } else {
      Course.findById(req.params.id)
        .then(course => {
          // If the course owner Id matches the currently authenticated user Id...
          if (course.user._id.equals(req.currentUser._id)) {
            Course.findByIdAndUpdate(req.params.id, req.body).then(course =>
              res
                .status(204)
                .end()
                .setHeader('Location', `/api/course/${course._id}`)
            );
          } else {
            res.status(403).json({
              message: 'You can only update your own courses.',
              currentUser: req.currentUser.emailAddress,
            });
          }
        })
        .catch(() => res.status(404).json({ message: 'Course Not Found!' }));
    }
  })
);

/**
 * @listens   DELETE api/courses/:id
 * @desc      Delete A Course
 * @access    Private
 */
router.delete(
  '/:id',
  authenticateUser,
  asycnHandler(async (req, res) => {
    // retrieve the course
    Course.findById(req.params.id)
      .then(course => {
        // If the course owner Id matches the currently authenticated user Id...
        if (course.user._id.equals(req.currentUser._id)) {
          Course.findByIdAndRemove(req.params.id).then(course => res.status(204).end());
        } else {
          res.status(403).json({
            message: 'You can only update your own courses.',
            currentUser: req.currentUser.emailAddress,
          });
        }
      })
      .catch(() => res.status(404).json({ message: 'Course Not Found!' }));
  })
);

module.exports = router;
