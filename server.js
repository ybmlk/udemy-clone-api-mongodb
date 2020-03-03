// Import Modules
const express = require('express');
const mongoose = require('mongoose');

// Import routes
const courses = require('./routes/courses');
const users = require('./routes/users');

const app = express();

// Bodyparser middleware
app.use(express.json());

// DB config (mongoURI)
const db = require('./config/key').mongoURI;

// connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Use Routes
app.use('/api/courses', courses);
// app.use('/api/users', users);

// listen to port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server sterted on port ${port}`));
