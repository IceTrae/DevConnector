const express = require('express');
const router = express.Router();
const Profile = require('../../models/Profile');
const passport = require('passport');

const profileValidation = require('../../validation/profile');

// @route   Get api/profile/
// @desc    Return current users profile
// @access  Private
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;
    const errors = {};
    Profile.findOne({ user: user.id })
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
        .findOne({ user: user.id })
        .then(profile => {
            if (profile) {
                errors.user = 'Profile already exists.';
                return res.status(400).json(errors);
            }

            const newProfile = new Profile({
                user: user.id,
                ...profileFields
            });

            Profile.findOne({ handle: profileFields.handle })
                .then(profile => {
                    if (profile) {
                        errors.handle = 'that handle already exits';
                        return res.status(400).json(errors);
                    }

                    newProfile.save()
                        .then(profile => { res.json(trimProfile(profile)) })
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
        .findOne({ user: user.id })
        .then(profile => {
            if (!profile) {
                errors.user = 'Profile not found.';
                return res.status(404).json(errors);
            }

            Profile
                .findOneAndUpdate({ user: user.id }, { $set: profileFields }, { new: true })
                .then(profile => { res.json(trimProfile(profile)) })
                .catch(err => console.log(err));
        });
});

function trimProfile(profile) {
    var newProfile = profile.toObject();
    newProfile.id = newProfile._id;
    const { __v, _id, ...trimProfile } = newProfile;
    return trimProfile;
}

module.exports = router;