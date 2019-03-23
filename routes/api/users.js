const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.get('/', (req, res) => res.json({ msg: "Users works" }));

// @route   Get api/users/register
// @desc    Register a user
// @access  Public
router.post('/register', (req, res) => {
    User
        .findOne({ email: req.body.email })
        .then(user => {
            if (user) {
                return res.status(400).json({ email: 'Email already exists' });
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

// @route   Get api/users/login
// @desc    Allows a registered user to login / Returns Token
// @access  Public
router.post('/login', (req, res) => {
    const email = req.body.email
    const pwd = req.body.password
    User
        .findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ email: 'User not found.' });
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
                        return res.status(403).json({ password: 'Password incorrect.' });
                    }
                });
        });
});
module.exports = router;