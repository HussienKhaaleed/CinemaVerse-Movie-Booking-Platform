//moviesModel.js
const mongoose = require("mongoose");

const moviesSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    posterImage: {
      type: String,
      required: [true, "Movie poster image is required"],
    },
    description: { type: String, default: "no description" },
    price: {
      type: Number,
      min: [0, "price can't be less than 0"],
      required: true,
    },
    releaseYear: { type: Number },
    category: {
      type: String,
      enum: [
        "action",
        "comedy",
        "drama",
        "thriller",
        "horror",
        "romance",
        "sci-fi",
        "animation",
        "documentary",
        "other",
      ],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

moviesSchema.pre("save", function (next) {
  if (this.category) {
    this.category = this.category.toLowerCase();
  }
  next();
});

module.exports = mongoose.model("Movie", moviesSchema);
