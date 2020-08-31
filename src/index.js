const app = require("./app");

const port = process.env.PORT;
//create a middleware
// app.use((req, res, next) => {
//   if (req.method === "GET") {

//   } else {
//     next();
//   }
// });

//listen
app.listen(port, () => {
  console.log("Server is running on port: " + port);
});
