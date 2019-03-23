const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('users');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.AUTH_SECRET

module.exports = passport => {
    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        User.findById(jwt_payload.id)
            .then(user => {
                if (user) {
                    var newUser = user.toObject();
                    newUser.id = newUser._id;
                    const { password, __v, _id, ...trimUser } = newUser;
                    return done(null, trimUser);
                }

                return done(null, false);
            })
            .catch(err => console.log(err));
    }));
};