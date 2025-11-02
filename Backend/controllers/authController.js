const jwtLib = require("jsonwebtoken");
const UserModel = require("../models/usersModel"); // --> update path to actual file if you named usersModel.js
const { OAuth2Client } = require("google-auth-library");
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createJwt(userId) {
  return jwtLib.sign({ id: userId }, process.env.JWT_SECRET_KEY, {
    expiresIn: "10d",
  });
}

exports.handleSignup = async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.password ) {
      return res.status(400).json({
        status: "error",
        message: "missing fields",
      });
    }

    const user = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      // confirmPassword: req.body.confirmPassword,
    });
    const token = createJwt(user._id);
    res.cookie("jwt_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 10),
      httpOnly: true,
    });
    user.password = undefined;
    res.status(201).json({
      status: "success",
      user,
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.handleSignin = async function (req, res, next) {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        status: "error",
        message: "missing fields",
      });
    }

    const user = await UserModel.findOne({
      email: req.body.email,
    }).select("+password");
    if (!user || !(await user.checkPassword(req.body.password))) {
      return res.status(400).json({
        status: "error",
        message: "invalid email or password",
      });
    }
    const token = createJwt(user._id);
    res.cookie("jwt_token", token, {
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 10),
      httpOnly: true,
    });
    res.status(200).json({
      status: "success",
      user,
      token,
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.googleAuth = async function (req, res, next) {
  try {
    const { token } = req.body; // Frontend will send the Google ID token
    if (!token)
      return res
        .status(400)
        .json({ status: "error", message: "Missing token" });

    // Verify the token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    // find or create user
    let user = await UserModel.findOne({ email });
    if (!user) {
      user = await UserModel.create({
        name,
        email,
        googleId,
        authProvider: "google",
        profileImage: picture,
        password: undefined,
        confirmPassword: undefined,
      });
    }

    const jwtToken = createJwt(user._id);

    res.cookie("jwt_token", jwtToken, {
      expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      user,
      token: jwtToken,
    });
  } catch (err) {
    console.error("Google login error:", err);
    res.status(400).json({ status: "error", message: "Invalid Google token" });
  }
};

exports.protectedRoute = async function (req, res, next) {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.jwt_token) {
      token = req.cookies.jwt_token;
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "you should login first",
      });
    }

    const decodedToken = jwtLib.verify(token, process.env.JWT_SECRET_KEY);
    const user = await UserModel.findById(decodedToken.id);
    if (user) {
      req.user = user;
      return next();
    }
    return res.status(401).json({ status: "error", message: "User not found" });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};

exports.restrictedTo = function (role) {
  return (req, res, next) => {
    if (req.user.role === role) return next();
    return res.status(403).json({
      status: "error",
      message: "Not permitted Request",
    });
  };
};
