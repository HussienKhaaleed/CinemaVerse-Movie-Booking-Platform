//app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const authRouter = require("./routes/authRoute");
const moviesRouter = require("./routes/moviesRoute");
const usersRouter = require("./routes/usersRoute");
const bookingRouter = require("./routes/bookingRoute");
const bookingController = require("./controllers/bookingController");

const app = express();

// Serve static
// app.use(express.static(path.join(__dirname, "public")));

// Stripe webhook route MUST be before express.json()
app.post(
  "/api/v1/bookings/webhook",
  express.raw({ type: "application/json" }),
  bookingController.handleStripeWebhook,
);

app.use(express.json());
app.use(cors());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/bookings", bookingRouter);

module.exports = app;
