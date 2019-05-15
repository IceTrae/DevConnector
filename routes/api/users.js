const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");

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
router.post(
  "/register",
  [
    check("name", "Name is required.")
      .not()
      .isEmpty(),
    check("email", "Please include a valid email address.").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters."
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email already exists." }] });
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
  }
);

// @route   Post api/users/login
// @desc    Allows a registered user to login / Returns Token
// @access  Public
router.post(
  "/login",
  [
    check("email", "Please include a valid email address.").isEmail(),
    check("password", "Please enter a password.").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const email = req.body.email;
    const pwd = req.body.password;
    let error = {};
    try {
      const user = await User.findOne({ email });
      if (!user) {
        error.email = "Invalid credentials.";
        return res
          .status(401)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

      const isMatch = await bcrypt.compare(pwd, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ errors: [{ msg: "Invalid credentials" }] });
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
  }
);

module.exports = router;
