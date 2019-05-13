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
  User.findOne({ email })
    .then(user => {
      if (!user) {
        error.email = "User not found.";
        return res.status(404).json(error);
      }

      bcrypt.compare(pwd, user.password).then(isMatch => {
        if (isMatch) {
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
        } else {
          errors.password = "Password incorrect.";
          return res.status(401).json(errors);
        }
      });
    })
    .catch(err => {
      console.log(err);
    });
});

module.exports = router;
