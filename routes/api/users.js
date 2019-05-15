const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const auth = require("../../middleware/auth");

const registerValidation = require("../../validation/register");
const loginValidation = require("../../validation/login");

// @route   Get api/users/current
// @desc    Return current user
// @access  Private
router.get("/current", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.sendStatus(401);
  }
});

// @route   Post api/users/register
// @desc    Register a user
// @access  Public
router.post("/register", async (req, res) => {
  const { errors, isValid } = registerValidation(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      errors.email = "Email already exists.";
      return res.status(400).json(errors);
    }

    const avatar = gravatar.url(email, {
      s: 200, // Size
      r: "pg", // Rating
      d: "mm" // Default
    });

    user = new User({
      name,
      email,
      avatar,
      password
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    const payload = {
      user: {
        id: user.id
      }
    };
    const expireTime = 7200;
    jwt.sign(
      payload,
      process.env.AUTH_SECRET,
      { expiresIn: expireTime },
      (err, token) => {
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.sendStatus(500);
  }
});

// @route   Post api/users/login
// @desc    Allows a registered user to login / Returns Token
// @access  Public
router.post("/login", async (req, res) => {
  const { errors, isValid } = loginValidation(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const email = req.body.email;
  const pwd = req.body.password;
  let error = {};
  try {
    const user = await User.findOne({ email });
    if (!user) {
      error.email = "Invalid credentials.";
      return res.status(401).json(error);
    }

    const isMatch = await bcrypt.compare(pwd, user.password);
    if (!isMatch) {
      error.email = "Invalid credentials.";
      return res.status(401).json(error);
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    const expireTime = 7200;
    jwt.sign(
      payload,
      process.env.AUTH_SECRET,
      { expiresIn: expireTime },
      (err, token) => {
        res.json({
          token: token
        });
      }
    );
  } catch (err) {
    console.error(err);
    return res.sendStatus(401);
  }
});

module.exports = router;
