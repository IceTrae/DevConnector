require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/api/users')
const profile = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const port = process.env.PORT || 5000;
const app = express();
mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'));

// Use Routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);
app.listen(port, () => console.log(`Server running on port ${port} ${process.env.TEST_ENV}`));
