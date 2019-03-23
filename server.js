require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const port = process.env.PORT || 5000;
const app = express();
mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err))

app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`Server running on port ${port} ${process.env.TEST_ENV}`));
