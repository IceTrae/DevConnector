const validator = require('validator');

module.exports = function validateRegisterInput(data) {
    let errors = {};

    if (!validator.isEmail(data.email || '')) {
        errors.email = 'Email is not in a valid format.';
    }

    if (!validator.isLength(data.password || '', { min: 8 })) {
        errors.password = 'Password must be at least 8 characters';
    }

    if (!validator.isLength(data.name || '', { min: 2, max: 30 })) {
        errors.name = 'Name must be between 2 and 30 characters';
    }

    if (!data.email) {
        errors.email = 'Email field is required'
    }

    if (!data.password) {
        errors.password = 'Password field is required'
    }

    if (!data.name) {
        errors.name = 'Name field is required'
    }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}