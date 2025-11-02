//usersRoute.js
const express = require("express");
const authController = require("../controllers/authController");
const usersController = require("../controllers/usersController");

const usersRouter = express.Router();

usersRouter
  .route("/me")
  .get(authController.protectedRoute, usersController.getMe);

module.exports = usersRouter;
