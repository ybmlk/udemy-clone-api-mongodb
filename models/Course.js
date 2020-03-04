const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const CourseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    estimatedTime: {
      type: String,
    },
    materialsNeeded: {
      type: String,
    },
    user: {
      type: Object,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true } // authomatically adds CreatedAt, updatedAt
);

module.exports = Course = mongoose.model('course', CourseSchema);
