//usersModel.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: [true, "email is required"],
    },
    password: {
      type: String,
      select: false,
    },
    // confirmPassword: {
    //   type: String,
    //   validate: {
    //     validator: function (data) {
    //       if (this.authProvider === "google") return true; // skip for Google
    //       return data === this.password;
    //     },
    //     message: "password must match the confirm password",
    //   },
    //   select: false,
    // },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    name: {
      type: String,
      default: "user",
    },
    googleId: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    profileImage: { type: String, default: null },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("email")) this.email = this.email.toLowerCase();

  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 12);
    // this.confirmPassword = undefined;
  }

  next();
});

userSchema.methods.checkPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
