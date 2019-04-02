const validator = require('validator');
const Post = require('../models/Post');

module.exports = function validatePostInput(data) {
    let errors = {};

    if (!validator.isLength(data.text || '', { min: 10, max: 300 })) {
        errors.text = 'Text must be between 10 and 300 characters.';
    }

    if (!data.text || '') {
        errors.text = 'Text field is required';
    }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}