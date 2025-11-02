//bookingModel.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Booking must belong to a user"],
    },
    movie: {
      type: mongoose.Schema.ObjectId,
      ref: "Movie",
      required: [true, "Booking must be for a movie"],
    },
    showTime: {
      type: Date,
      required: [true, "Show time is required"],
    },
    ticketsCount: {
      type: Number,
      required: [true, "Number of tickets is required"],
      min: [1, "At least one ticket must be booked"],
    },
    amountPaid: {
      type: Number,
      required: [true, "Payment amount is required"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.pre(/^find/, function (next) {
  this.populate("user", "name email").populate("movie", "title posterImage");
  next();
});

bookingSchema.virtual("status").get(function () {
  const now = new Date();
  const showStart = new Date(this.showTime);
  const showEnd = new Date(showStart.getTime() + 3 * 60 * 60 * 1000);
  if (now < showStart) return "upcoming";
  if (now >= showStart && now <= showEnd) return "in-progress";
  return "completed";
});

module.exports = mongoose.model("Booking", bookingSchema);
