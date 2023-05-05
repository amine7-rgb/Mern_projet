const passport = require("passport");

const GoogleStrategy = require('passport-google-oauth20').Strategy;



// Global Variables

const GOOGLE_CLIENT_ID = "226351625834-2024b8effaflh1rft4jnfkhb08hgr734.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET  = "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"



// Configure Google authentication strategy
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
function(accessToken, refreshToken, profile, cb) {
    const User = require('./app/models/user.model')
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
    });
    //done(null, profile)
}
));

passport.serializeUser((User, done)=>{
    done(null, User)
});

passport.deserializeUser((User, done)=>{
    done(null, User)
});