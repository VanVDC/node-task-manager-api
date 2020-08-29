const express = require("express");
require("./db/mongoose"); //auto activate and connect ot mongodb
// const User = require("./models/user");
// const Task = require("./models/task");

const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const app = express();

const port = process.env.PORT;
//create a middleware
// app.use((req, res, next) => {
//   if (req.method === "GET") {

//   } else {
//     next();
//   }
// });

app.use(express.json()); //turn everything into object
app.use(userRouter);
app.use(taskRouter);

//listen
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
