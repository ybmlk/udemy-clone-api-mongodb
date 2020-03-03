// Import Modules
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Bodyparser middleware
app.use(express.json());

// DB config
const db = require('./config/key').mongoURI;

// connect to MongoDB
mongoose
  .connect(db)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// listen to port
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server sterted on port ${port}`));
