const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const passport = require('passport');

const profileValidation = require('../../validation/profile');
const experienceValidation = require('../../validation/experience');



// @route   Get api/profile
// @desc    Get all profiles
// @access  Public
router.get('/', (req, res) => {
    const errors = {};
    Profile
        .find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                return res.json([]);
            }

            res.json(profiles);
        })
        .catch(err => res.status(404));
});

// @route   Get api/profile/handle/:handle
// @desc    Get profile by handle
// @access  Public
router.get('/handle/:handle', (req, res) => {
    const errors = {};
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404));
});

// @route   Get api/profile/user/:id
// @desc    Get profile by id
// @access  Public
router.get('/user/:id', (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.params.id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404));
});

// @route   Get api/profile/
// @desc    Return current users profile
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;
    const errors = {};
    Profile.findOne({ user: user._id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noProfile = 'There is no profile for this user';
                res.status(404).json(errors);
            }

            res.json(profile);
        })
        .catch(err => res.status(404));
});

// @route   Post api/profile
// @desc    Create profile
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;
    const { ...profileFields } = req.body;
    if (profileFields.skills && typeof profileFields.skills === String) {
        profileFields.skills = profileFields.skills.split(',').map(i => i.trim());
    }
    const { errors, isValid } = profileValidation(profileFields);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile
        .findOne({ user: user._id })
        .then(profile => {
            if (profile) {
                errors.user = 'Profile already exists.';
                return res.status(400).json(errors);
            }

            const newProfile = new Profile({
                user: user._id,
                ...profileFields
            });

            Profile.findOne({ handle: profileFields.handle })
                .then(profile => {
                    if (profile) {
                        errors.handle = 'that handle already exits';
                        return res.status(400).json(errors);
                    }

                    newProfile.save()
                        .then(profile => { res.json(profile) })
                        .catch(err => console.log(err));
                });
        });
});

// @route   PUT api/profile
// @desc    Update profile
// @access  Private
router.put('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;
    const { ...profileFields } = req.body;
    if (profileFields.skills && typeof profileFields.skills === String) {
        profileFields.skills = profileFields.skills.split(',').map(i => i.trim());
    }
    const { errors, isValid } = profileValidation(profileFields);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile
        .findOne({ user: user._id })
        .then(profile => {
            if (!profile) {
                errors.user = 'Profile not found.';
                return res.status(404).json(errors);
            }

            Profile
                .findOneAndUpdate({ user: user._id }, { $set: profileFields }, { new: true })
                .then(profile => { res.json(profile) })
                .catch(err => console.log(err));
        });
});

// @route   POST api/profile/experience
// @desc    Create new experience entry on the current users profile
// @access  Private
router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;
    const { ...fields } = req.body;
    const { errors, isValid } = experienceValidation(fields);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    Profile
        .findOne({ user: user._id })
        .then(profile => {
            if (!profile) {
                errors.user = 'Profile not found.';
                return res.status(404).json(errors);
            }

            profile.experience.unshift(fields);
            profile.save().then(profile => res.json(profile));
        });
});

module.exports = router;