const validator = require('validator');
const Profile = require('../models/Profile');

module.exports = function validateExperienceInput(data) {
    let errors = {};

    if (!data.title || '') {
        errors.title = 'Job Title field is required';
    }

    if (!data.company || '') {
        errors.company = 'Company field is required';
    }

    if (!data.from || '') {
        errors.from = 'From date field is required';
    }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}