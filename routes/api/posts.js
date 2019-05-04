const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const passport = require('passport');

const postValidation = require('../../validation/post');
const postCommentValidation = require('../../validation/postComment');

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
// @desc    Create a post
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

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put('/like/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { user } = req;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.sendStatus(404);
        }

        const likeIndex = post.likes.map(like => like.user._id.toString()).indexOf(req.user._id.toString());
        if (likeIndex >= 0) {
            return res.sendStatus(204);
        } else {
            post.likes.unshift({ user: req.user });
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put('/unlike/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { user } = req;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.sendStatus(404);
        }

        const likeIndex = post.likes.map(like => like.user._id.toString()).indexOf(req.user._id.toString());
        if (likeIndex >= 0) {
            post.likes.splice(likeIndex, 1);
        } else {
            return res.sendStatus(204);
        }

        await post.save();
        res.json(post.likes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }
});

// @route   POST api/posts/:id/comment
// @desc    Create a comment on a post
// @access  Private
router.post('/:id/comment', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { user } = req;
    const { ...fields } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.sendStatus(404);
    }

    const comment = {
        user: user._id,
        name: user.name,
        avatar: user.avatar,
        ...fields
    };

    const { errors, isValid } = postCommentValidation(comment);
    if (!isValid) {
        return res.status(400).json(errors);
    }

    post.comments.unshift(comment);
    post.save()
        .then(post => { res.json(post.comments) })
        .catch(err => console.log(err));
});

// @route   Delete api/posts/:id/comment/:commentId
// @desc    Delete a comment on a post
// @access  Private
router.delete('/:id/comment/:commentId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { user } = req;
    const { ...fields } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).send("Post not found.");
    }

    let commentIndex = post.comments.map(comment => comment._id.toString()).indexOf(req.params.commentId);
    if (commentIndex < 0) {
        return res.status(404).send('Comment not found.');
    }

    if (post.comments[commentIndex].user._id.toString() !== user._id.toString()) {
        return sendStatus(401);
    }

    post.comments.splice(commentIndex, 1);
    post.save()
        .then(post => { res.json(post.comments) })
        .catch(err => console.log(err));
});

module.exports = router