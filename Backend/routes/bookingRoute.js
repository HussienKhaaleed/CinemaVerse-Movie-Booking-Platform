//bookingRoute.js
const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const bookingRouter = express.Router();

bookingRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  bookingController.handleStripeWebhook,
);

bookingRouter.post(
  "/create-checkout-session",
  authController.protectedRoute,
  bookingController.createCheckoutSession,
);

bookingRouter.get(
  "/my-bookings",
  authController.protectedRoute,
  bookingController.getMyBookings,
);

module.exports = bookingRouter;
