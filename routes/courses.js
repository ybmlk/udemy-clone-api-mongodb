const express = require('express');
const router = express.Router();

// Course Model
const Course = require('../models/Course');

/**
 * @listens   GET api/courses
 * @desc      Get All Courses
 * @access    Public
 */
router.get('/', (req, res) => {
  Course.find()
    // Sorts by date in descending order
    .sort({ date: -1 })
    .then(courses => res.json(courses));
});

/**
 * @listens   GET api/courses/:id
 * @desc      Get An Individual Course
 * @access    Public
 */
router.get('/', (req, res) => {
  Course.findById(req.param.id).then(courses => res.json(courses));
});

/**
 * @listens   Post api/courses
 * @desc      Create A Course
 * @access    Private
 */
router.post('/', (req, res) => {
  const { title, description, estimatedTime, materialsNeeded } = req.body;
  const newCourse = new Course({
    title,
    description,
    estimatedTime,
    materialsNeeded,
  });

  newCourse.save().then(item => res.json(item));
});

/**
 * @listens   PUT api/courses/:id
 * @desc      Update A Course
 * @access    Private
 */
router.put('/', (req, res) => {
  Course.find()
    // Sorts by date in descending order
    .sort({ date: -1 })
    .then(courses => res.json(courses));
});

/**
 * @listens   DELETE api/courses/:id
 * @desc      Delete A Course
 * @access    Private
 */
router.delete('/', (req, res) => {
  Course.find()
    // Sorts by date in descending order
    .sort({ date: -1 })
    .then(courses => res.json(courses));
});

module.exports = router;
