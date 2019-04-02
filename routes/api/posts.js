const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const passport = require('passport');

const postValidation = require('../../validation/post');

// @route   Get api/posts
// @desc    Get all posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts));
});

// @route   Get api/posts/:id
// @desc    Get a post
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if (!post) {
                return res.sendStatus(404);
            }

            res.json(post)
        })
        .catch(err => res.sendStatus(404));
});

// @route   POST api/posts
// @desc    Post a post
// @access  Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;
    const { ...fields } = req.body;

    const newPost = new Post({
        user: user._id,
        name: user.name,
        avatar: user.avatar,
        ...fields
    });

    const { errors, isValid } = postValidation(newPost);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    newPost.save()
        .then(post => { res.json(post) })
        .catch(err => console.log(err));
});

// @route   DELETE api/posts
// @desc    Delete post
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { user } = req;

    Post
        .findById(req.params.id)
        .then(post => {
            if (post.user._id.toString() !== user._id.toString()) {
                return res.send(401).json({ postUser: post.user._id.toString(), user: user._id.toString() });
            }

            post.remove().then(() => res.sendStatus(204));
        });
});

module.exports = router