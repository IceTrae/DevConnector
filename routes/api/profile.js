const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const passport = require("passport");
const auth = require("../../middleware/auth");

const profileValidation = require("../../validation/profile");
const experienceValidation = require("../../validation/experience");
const educationValidation = require("../../validation/education");

// @route   Get api/profile
// @desc    Get all profiles
// @access  Public
router.get("/", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profiles => {
      if (!profiles) {
        return res.json([]);
      }

      res.json(profiles);
    })
    .catch(err => res.status(404));
});

// @route   Get api/profile/user/:id
// @desc    Get profile by id
// @access  Public
router.get("/user/:id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no profile for this user";
        res.status(404).json(errors);
      }

      res.json(profile);
    })
    .catch(err => res.status(404));
});

// @route   Get api/profile/
// @desc    Return current users profile
// @access  Private
router.get("/current", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(404).json({ errors: [{ msg: "Profile not found." }] });
    }

    res.json(profile);
  } catch (error) {
    return res.status(404).json({ errors: [{ msg: "Profile not found." }] });
  }
});

// @route   Post api/profile
// @desc    Create profile
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status field is required")
        .not()
        .isEmpty(),
      check("skills", "Skills field is required")
        .not()
        .isEmpty(),
      check("website", "Website must be a valid url").isURL(),
      check("youtube", "YouTube profile must be a valid url").isURL(),
      check("twitter", "Twitter profile must be a valid url").isURL(),
      check("facebook", "Facebook profile must be a valid url").isURL(),
      check("linkedin", "LinkedIn Profile must be a valid url").isURL(),
      check("instagram", "Instagram profile must be a valid url").isURL()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const data = req.body;
    if (data.skills && typeof data.skills === String) {
      data.skills = data.skills.split(",").map(s => s.trim());
    }

    data.social = {
      youtube: data.youtube,
      twitter: data.twitter,
      facebook: data.facebook,
      linkedin: data.linkedin,
      instagram: data.instagram
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Profile already exists." }] });
      }

      const newProfile = new Profile({
        user: req.user.id,
        ...data
      });

      await newProfile.save();
      res.status(201).json(newProfile);
    } catch (err) {
      console.error(err.message);
      res.sendStatus(500);
    }
  }
);

// @route   PUT api/profile
// @desc    Update profile
// @access  Private
router.put(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;
    const { ...profileFields } = req.body;
    if (profileFields.skills && typeof profileFields.skills === String) {
      profileFields.skills = profileFields.skills.split(",").map(i => i.trim());
    }
    const { errors, isValid } = profileValidation(profileFields);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: user._id }).then(profile => {
      if (!profile) {
        errors.user = "Profile not found.";
        return res.status(404).json(errors);
      }

      Profile.findOneAndUpdate(
        { user: user._id },
        { $set: profileFields },
        { new: true }
      )
        .then(profile => {
          res.json(profile);
        })
        .catch(err => console.log(err));
    });
  }
);

// @route   POST api/profile/experience
// @desc    Create new experience entry on the current users profile
// @access  Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;
    const { ...fields } = req.body;
    const { errors, isValid } = experienceValidation(fields);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: user._id }).then(profile => {
      if (!profile) {
        errors.user = "Profile not found.";
        return res.status(404).json(errors);
      }

      profile.experience.unshift(fields);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/experience/:id
// @desc    Delete experience entry on the current users profile
// @access  Private
router.delete(
  "/experience/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;
    const errors = {};

    Profile.findOne({ user: user._id }).then(profile => {
      if (!profile) {
        errors.user = "Profile not found.";
        return res.status(404).json(errors);
      }

      const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.id);

      if (removeIndex < 0) {
        errors.user = "Experience not found.";
        return res.status(404).json(errors);
      }

      profile.experience.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   POST api/profile/education
// @desc    Create new education entry on the current users profile
// @access  Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;
    const { ...fields } = req.body;
    const { errors, isValid } = educationValidation(fields);
    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: user._id }).then(profile => {
      if (!profile) {
        errors.user = "Profile not found.";
        return res.status(404).json(errors);
      }

      profile.education.unshift(fields);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile/education/:id
// @desc    Delete experience entry on the current users profile
// @access  Private
router.delete(
  "/education/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;
    const errors = {};

    Profile.findOne({ user: user._id }).then(profile => {
      if (!profile) {
        errors.user = "Profile not found.";
        return res.status(404).json(errors);
      }

      const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.id);

      if (removeIndex < 0) {
        errors.user = "Education not found.";
        return res.status(404).json(errors);
      }

      profile.education.splice(removeIndex, 1);
      profile.save().then(profile => res.json(profile));
    });
  }
);

// @route   DELETE api/profile
// @desc    Delete user and profile
// @access  Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;

    Profile.findOneAndDelete({ user: user._id }).then(profile => {
      User.findOneAndDelete({ _id: user._id }).then(user => {
        res.sendStatus(204);
      });
    });
  }
);

module.exports = router;
