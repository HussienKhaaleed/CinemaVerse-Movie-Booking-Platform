//moviesController.js;
const MoviesModel = require("../models/moviesModel");
const path = require("path");

exports.handleAddMovie = async (req, res, next) => {
  try {
    const { title, description, price, posterImage, releaseYear, category } =
      req.body;

    if (!req.file && !posterImage)
      return res.status(400).json({
        status: "fail",
        message: "Movie poster image (file or URL) is required",
      });

    const finalImg = req.file ? req.file.filename : posterImage;
    const movie = await MoviesModel.create({
      title,
      description,
      price,
      releaseYear,
      category,
      posterImage: finalImg,
    });

    res.status(201).json({ status: "success", data: { movie } });
  } catch (err) {
    next(err);
  }
};

exports.handleGetAllMovies = async (req, res, next) => {
  try {
    const movies = await MoviesModel.find();

    const moviesWithPosters = movies.map((movie) => ({
      ...movie.toObject(),
      posterImage:
        movie.posterImage && movie.posterImage.startsWith("http")
          ? movie.posterImage
          : req.protocol +
            "://" +
            req.get("host") +
            "/moviePosters/" +
            movie.posterImage,
    }));

    res.status(200).json({
      status: "success",
      results: movies.length,
      data: { movies: moviesWithPosters },
    });
  } catch (err) {
    next(err);
  }
};

exports.handleGetMovie = async (req, res, next) => {
  try {
    const movie = await MoviesModel.findById(req.params.id);
    if (!movie)
      return res
        .status(404)
        .json({ status: "fail", message: "Movie not found" });

    const image = movie.posterImage;
    movie.posterImage = image.startsWith("http")
      ? movie.posterImage
      : req.protocol +
        "://" +
        req.get("host") +
        "/moviePosters/" +
        movie.posterImage;

    res.status(200).json({ status: "success", data: { movie } });
  } catch (err) {
    next(err);
  }
};

exports.handleUpdateMovie = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    if (req.file) updates.posterImage = req.file.filename;
    else if (req.body.posterImage) updates.posterImage = req.body.posterImage;

    const movie = await MoviesModel.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!movie)
      return res
        .status(404)
        .json({ status: "fail", message: "Movie not found" });

    const image = movie.posterImage;
    movie.posterImage = image.startsWith("http")
      ? movie.posterImage
      : req.protocol +
        "://" +
        req.get("host") +
        "/moviePosters/" +
        movie.posterImage;

    res.status(200).json({ status: "success", data: { movie } });
  } catch (err) {
    next(err);
  }
};

exports.handleDeleteMovie = async (req, res, next) => {
  try {
    const movie = await MoviesModel.findByIdAndDelete(req.params.id);
    if (!movie)
      return res
        .status(404)
        .json({ status: "fail", message: "Movie not found" });

    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};

// Middleware to restrict certain routes to admins
exports.checkAuthorization = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({
      status: "fail",
      message: "You are not authorized to perform this action",
    });
  next();
};
