const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const registerValidation = require('../../validation/register');
const loginValidation = require('../../validation/login');

router.get('/', (req, res) => res.json({ msg: "Users works" }));

// @route   Post api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', (req, res) => {
    const { errors, isValid } = registerValidation(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    User
        .findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                errors.email = 'Email already exists.';
                return res.status(400).json(errors);
            }

            const avatar = gravatar.url(req.body.email, {
                s: 200, // Size
                r: 'pg', // Rating
                d: 'mm', // Default
            });
            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                avatar,
                password: req.body.password
            });
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) throw err;
                    newUser.password = hash
                    newUser.save()
                        .then(user => res.json(user))
                        .catch(err => console.log(err));
                })
            })
        });
});

// @route   Post api/users/login
// @desc    Allows a registered user to login / Returns Token
// @access  Public
router.post('/login', (req, res) => {
    const { errors, isValid } = loginValidation(req.body);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    const email = req.body.email
    const pwd = req.body.password
    User
        .findOne({ email })
        .then(user => {
            if (!user) {
                error.email = 'User not found.'
                return res.status(404).json(errors);
            }

            bcrypt
                .compare(pwd, user.password)
                .then(isMatch => {
                    if (isMatch) {
                        const payload = {
                            id: user.id,
                            name: user.name,
                            avatar: user.avatar
                        };
                        const expireTime = 7200
                        jwt.sign(payload, process.env.AUTH_SECRET, { expiresIn: expireTime }, (err, token) => {
                            res.json({ access_token: token, token_type: 'Bearer', expires_in: expireTime });
                        });
                    } else {
                        errors.password = 'Password incorrect.'
                        return res.status(403).json(errors);
                    }
                });
        });
});

// @route   Get api/users/current
// @desc    Return current user
// @access  Private
router.get('/current', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json(req.user);
});

module.exports = router;