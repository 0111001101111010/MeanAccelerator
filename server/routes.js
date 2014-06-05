/*jslint node: true*/

var repos = {};
	repos.users = require('./controllers/users'),
	passport = require('passport');

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated()) {
		return next();
	}

	res.send(401);
};

module.exports = function (app, environmentConfig, mongoConnection) {
	/* add all routes here */

	//sign up
	app.post('/api/authenticate', function(req, res) {
		var newUser = req.body;

		repos.users(environmentConfig).create(newUser, function(err, user){
			if (err) {
				return res.send(400, err);
			}

			var responseData = {
				userId: user._id,
				role: null
			};

			res.send(201, responseData);
		});
	});

	//sign in
	app.get('/api/authenticate', passport.authenticate('local'), function(req, res) {
		//passport authenticate either already sent back an error message, or it'll return the new user as req.user
		var responseData = {
			userId: req.user._id,
			fullName: req.user.fullName,
			role: null
		};

		res.send(200, responseData);
	});


	//sign out
	app.delete('/api/authenticate', function(req, res) {
		req.logout();
		res.send(200);
	});

	//password reset - generate and save reset token
	app.post('/api/authenticate/forgotPassword', function(req, res) {
		//see if user exists
		repos.users(environmentConfig).getByEmail(req.body.email, function(err, user) {
			if(!user) {
				return res.send(400, 'We can\'t find a user with that email address!');
			}

			//generate random string
			var randomString = require('random-string'),
				passwordResetToken = randomString(); // a random String with the length of 8

			//save to db
			user.passwordResetToken = passwordResetToken;
			repos.users(mongoConnection).update(user._id, user, function(err) {
				if(err) {
					return res.send(400, err);
				}

				//email user
				var emailSender = require('./controllers/emailSender'),
					url = req.protocol + '://' + req.get('host') + '/#/resetPassword/' + passwordResetToken,
					body = 'You are receiving this email because a password reset on your account was requested. ' +
						'If you did not initiate this request then no action is required and your account is secure. ' +
						'If you did initiate this request then click the link below to update your password. ' +
						'<p><a href="' + url + '">Reset Password</a>' +
						'</p>';
    			emailSender(environmentConfig).sendEmail('erik@8020.co', 'Password reset', body);

			res.send(200);
			});
		});
	});

	//forgot password - confirm the password reset token is good
	app.get('/api/authenticate/forgotPassword/:passwordResetToken', function(req, res) {
		repos.users(mongoConnection).getByPasswordResetToken(req.params.passwordResetToken, function(err, user) {
			if(err) {
				return res.send(400, err);
			}

			var retData = {
				id: user._id,
				email: user.email
			};
			console.log('retData: ', retData);

			return res.send(200, retData);
		});
	});

	//forgot password - actually reset the password
	app.post('/api/authenticate/resetPassword', function(req, res) {
		var userId = req.body.userId,
			newPassword = req.body.newPassword;

		repos.users(mongoConnection).updatePassword(userId, newPassword, function(err, user) {
			if(err) {
				return res.send(400, err);
			}

			return res.send(200);
		});
	});

	// GET user
	app.get('/api/users/:userId', isLoggedIn, function(req, res){
		repos.users(mongoConnection).getById(req.params.userId, function(err, user){
			if(err) {
				return res.send(400, err);
			}

			res.send(200, user);
		});
	})

	// PUT user
	app.put('/api/users/:userId', isLoggedIn, function(req, res) {
		repos.users(mongoConnection).update(req.params.userId, req.body, function(err, user){
			if(err) {
				return res.send(400, err);
			}

			res.send(200);
		});
	});
};