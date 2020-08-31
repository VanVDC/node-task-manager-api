//express app without listen for testing+++

const express = require("express");
require("./db/mongoose"); //auto activate and connect ot mongodb
// const User = require("./models/user");
// const Task = require("./models/task");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const app = express();

app.use(express.json()); //turn everything into object
app.use(userRouter);
app.use(taskRouter);

module.exports = app;
