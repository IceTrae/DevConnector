const validator = require('validator');
const Profile = require('../models/Profile');

module.exports = function validateExperienceInput(data) {
    let errors = {};

    // if (!validator.isLength(data.handle || '', { min: 2, max: 40 })) {
    //     errors.handle = 'Handle must be between 2 and 40 characters.';
    // }

    // if (!data.handle || '') {
    //     errors.handle = 'Handle field is required';
    // }

    // if (!data.status || '') {
    //     errors.status = 'Status field is required';
    // }

    // if (!data.skills || '') {
    //     errors.skills = 'Skills field is required';
    // }

    // if (data.website && !validator.isURL(data.website)) {
    //     errors.website = 'Website must be a valid url';
    // }

    // if (data.social && data.social.youtube && !validator.isURL(data.social.youtube)) {
    //     errors.youtube = 'YouTube profile must be a valid url';
    // }

    // if (data.social && data.social.twitter && !validator.isURL(data.social.twitter)) {
    //     errors.twitter = 'Twitter profile must be a valid url';
    // }

    // if (data.social && data.social.facebook && !validator.isURL(data.social.facebook)) {
    //     errors.facebook = 'Facebook profile must be a valid url';
    // }

    // if (data.social && data.social.linkedin && !validator.isURL(data.social.linkedin)) {
    //     errors.linkedin = 'LinkedIn profile must be a valid url';
    // }

    // if (data.social && data.social.instagram && !validator.isURL(data.social.instagram)) {
    //     errors.instagram = 'Instagram profile must be a valid url';
    // }

    return {
        errors,
        isValid: !Object.keys(errors).length
    }
}