//server.js
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");
const app = require("./app");
mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => {
  console.log("connected to db");
});

const server = app.listen(5000, () => {
  console.log("server started at port 5000");
});
