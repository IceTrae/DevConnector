const validator = require('validator');
const Profile = require('../models/Profile');

module.exports = function validateProfileInput(data) {
    let errors = {};

    if (!data.handle) {
        errors.handle = 'Handle field is required'
    }

    if (!data.status) {
        errors.status = 'Status field is required'
    }

    if (!data.skills) {
        errors.skills = 'Skills field is required'
    }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}