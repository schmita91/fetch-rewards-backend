const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

const fetchRouter = require('./router/fetchRouter');

app.use(bodyParser.json());
app.use(cors());
app.use(fetchRouter);


module.exports = app;