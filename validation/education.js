const validator = require('validator');
const Profile = require('../models/Profile');

module.exports = function validateEducationInput(data) {
    let errors = {};

    if (!data.school || '') {
        errors.school = 'School field is required';
    }
    if (!data.degree || '') {
        errors.degree = 'Degree field is required';
    }
    if (!data.fieldOfStudy || '') {
        errors.fieldOfStudy = 'Field of Study field is required';
    }
    if (!data.from || '') {
        errors.from = 'From Date field is required';
    }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}