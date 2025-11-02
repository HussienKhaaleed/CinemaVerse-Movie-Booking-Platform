//moviesRoute.js
const express = require("express");
const moviesController = require("../controllers/moviesController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authController = require("../controllers/authController");

const movieRouter = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../public", "moviePosters");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    req.fileName = Date.now().toString() + path.extname(file.originalname);
    cb(null, req.fileName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(null, false);
};

const upload = multer({ storage, fileFilter });

movieRouter
  .route("/")
  .post(
    authController.protectedRoute,
    moviesController.checkAuthorization,
    upload.single("moviePoster"),
    moviesController.handleAddMovie,
  )
  .get(moviesController.handleGetAllMovies);

movieRouter
  .route("/:id")
  .get(moviesController.handleGetMovie)
  .patch(
    authController.protectedRoute,
    moviesController.checkAuthorization,
    upload.single("moviePoster"),
    moviesController.handleUpdateMovie,
  )
  .delete(
    authController.protectedRoute,
    moviesController.checkAuthorization,
    moviesController.handleDeleteMovie,
  );

module.exports = movieRouter;
