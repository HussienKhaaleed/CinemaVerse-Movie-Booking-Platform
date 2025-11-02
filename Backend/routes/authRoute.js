//authRoute.js
const express = require("express");
const authController = require("../controllers/authController");

const authRouter = express.Router();

authRouter.route("/register").post(authController.handleSignup);
authRouter.route("/signin").post(authController.handleSignin);
authRouter.route("/google").post(authController.googleAuth);

module.exports = authRouter;
