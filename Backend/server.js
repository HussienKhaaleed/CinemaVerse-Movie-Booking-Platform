//server.js
const dotenv = require("dotenv");
dotenv.config({ path: `${__dirname}/.env` });
const mongoose = require("mongoose");
const app = require("./app");

// Use PORT from environment variable (for deployment) or 5000 (for local)
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_CONNECTION_STRING).then(() => {
  console.log("connected to db");
});

const server = app.listen(PORT, () => {
  console.log(`server started at port ${PORT}`);
});
