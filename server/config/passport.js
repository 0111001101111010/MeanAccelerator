// load all the things we need
var LocalStrategy = require('passport-local').Strategy,
    userController = require('../controllers/users');

// expose this function to our app using module.exports
module.exports = function(passport, mongoConnection) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        var cb = done || function(){};
        cb(null, user._id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(_id, done) {
        var cb = done || function(){};
        userController(mongoConnection).getById(_id, function(err, user) {
            cb(err, user);
        });
    });

    passport.use('local', new LocalStrategy({
             // by default, local strategy uses username and password, we will override with email
             usernameField : 'email',
             passwordField : 'password',
             passReqToCallback : true // allows us to pass back the entire request to the callback
         },
         function(req, email, password, done) {

            //must tick or the below code (inside the function) won't get called
            process.nextTick(function() {
             var cb = done || function() {};

             // find a user whose email is the same as the forms email
             // we are checking to see if the user trying to login already exists
             userController(mongoConnection).getByEmailAndPassword(email, password, function(err, returnData) {
                 cb(err, returnData);
             });    
         });
        })
    );

};