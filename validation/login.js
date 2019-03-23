const validator = require('validator');

module.exports = function validateRegisterInput(data) {
    let errors = {};

    if (!validator.isEmail(data.email || '')) {
        errors.email = 'Email is not in a valid format.';
    }

    if (!data.email) {
        errors.email = 'Email field is required'
    }

    if (!data.password) {
        errors.password = 'Password field is required'
    }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}