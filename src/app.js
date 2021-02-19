const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const fetchRouter = require('./router/fetchRouter');

app.use(bodyParser.json());
app.use(fetchRouter);


module.exports = app;