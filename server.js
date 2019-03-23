require('dotenv').config();
const express = require('express');

const port = process.env.PORT || 5000
const app = express();

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`Server running on port ${port} ${process.env.TEST_ENV}`))
