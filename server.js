// Import Modules
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');

// Import routes
const courses = require('./routes/courses');
const users = require('./routes/users');

// Create Express app
const app = express();

// Enable all CORS Requests
app.use(cors());

// Setup morgan which gives us http request logging
app.use(morgan('dev'));

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
app.use('/api/users', users);

// listen to port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server sterted on port ${port}`));
