function userController(mongoConnection) {

	var mongo = require('mongodb').MongoClient,
		ObjectID = require('mongodb').ObjectID,
		collectionName = 'users',
		bcrypt = require('bcrypt-nodejs');

	return {
		getById: function (id, callback) {
			var cb = callback || function(){};

			mongoConnection.getDb(function(db) {
				var collection = db.collection(collectionName);
				collection.findOne({ _id: new ObjectID(id) }, function(lookupError, user) {
					if(lookupError){
						return cb(lookupError, null);
					}

					if(!user) {
						return cb('No user with that id was found.', null);
					}

					cb(null, user);
				});
			});
		},

		getByEmail: function(email, callback) {
			var cb = callback || function(){};

			mongoConnection.getDb(function(db) {
				var collection = db.collection(collectionName);
				collection.findOne({email: email}, function(lookupError, user) {
					if(lookupError){
						return cb(lookupError, null);
					}

				    cb(null, user);
				});
			});
		},

		getByPasswordResetToken: function(passwordResetToken, callback) {
			var cb = callback || function(){};

			mongoConnection.getDb(function(db) {
				var collection = db.collection(collectionName);
				collection.findOne({ passwordResetToken: passwordResetToken }, function(lookupError, user) {
					if(lookupError){
						return cb(lookupError, null);
					}

					if(!user) {
						return cb('Invalid password reset token.', null);
					}

				    cb(null, user);
				});
			});
		},

		getByEmailAndPassword: function(email, password, callback) {
			var cb = callback || function(){};

			mongoConnection.getDb(function(db) {
				var collection = db.collection(collectionName);
				collection.findOne({email: email}, function(lookupError, user) {
					if(lookupError){
						return cb(lookupError, null);
					}

					if(!user) {
						return cb('No user with that email address.', null);
					}

					//a user w/ that email is in the DB. See if hash is correct
					bcrypt.compare(password, user.password, function(err, res) {
					    if(!res) {
					    	return cb('Invalid password', null);
					    }

					    cb(null, user);
					});
				});
			});
		},

		create: function (user, callback) {	
			var cb = callback || function(){},
				validationErrors = this.validate(user);

			if(validationErrors.length) {
				return cb(validationErrors, null);
			}

			mongoConnection.getDb(function(db) {
				var collection = db.collection(collectionName);

				//see if email is already used
				collection.count({email: user.email}, function(err, count) {
					if(count) {
						return cb('That email address is being used by an existing user.', null);
					}

					//time to insert - hass password first
					bcrypt.genSalt(10, function(err, salt) {
					    bcrypt.hash(user.password, salt, function(){}, function(err, hash) {
					    	user.password = hash;

					        collection.insert(user, function(insertErr, users) {
								if(insertErr) {
									return cb(insertErr, null);
								}

								cb(null, users[0]);
							});
					    });
					});					
				});
			});	
		},

		update: function (id, user, callback) {
			var cb = callback || function(){},
				validationErrors = this.validate(user, true);

			if(validationErrors.length) {
				return cb(validationErrors, null);
			}

			if(id !== user._id) {
				return cb('Id and User.Id do not match', null);
			}

			//convert the IDs to ObjectIDs
			if(typeof id !== 'object') {
				id = new ObjectID(id);
			}

			if(typeof user._id !== 'object') {
				user._id = new ObjectID(user._id);
			}

			mongoConnection.getDb(function(db) {
				var collection = db.collection(collectionName);

				//see if email is already used by other users
				collection.findOne({ _id: id }, function(lookupErr, existingUser) {
					if(lookupErr) {
						return cb(lookupErr, null);
					}

					if(!existingUser) {
						return cb('We\'re unable to find you in our database.', null);
					}

					//ensure someone else isn't using the email address (that they may be changing to)
					collection.count({ _id: { $ne: id }, email: user.email }, function(err, count) {
						if(count) {
							return cb('That email address is being used by another user.', null);
						}

						//we're clear to persist, but did they set the password?						
						if(user.password) {
							bcrypt.genSalt(10, function(err, salt) {
							    bcrypt.hash(user.password, salt, function(){}, function(err, hash) {
							    	user.password = hash;

							        collection.update({ _id: id }, user, function(updateErr){
										if(updateErr) {
											return cb(updateErr, null);
										}

										return cb(null, null);
									});
							    });
							});

						} else {
							//set their password so we don't lose it
							user.password = existingUser.password;

							collection.update({ _id: id }, user, function(updateErr){
								if(updateErr) {
									return cb(updateErr, null);
								}

								return cb(null, null);
							});
						}
					});										
				});
			});	
		},

		updatePassword: function(id, newPassword, callback) {
			var cb = callback || function(){};

			this.getById(id, function(err, user) {
				if(err) {
					return cb(err, null);
				}

				if(!user) {
					return cb('Error finding user.', null);
				}

				bcrypt.genSalt(10, function(err, salt) {
				    bcrypt.hash(newPassword, salt, function(){}, function(err, hash) {
				    	mongoConnection.getDb(function(db) {
							user.password = hash;
							var collection = db.collection(collectionName);
					        collection.update({ _id: user._id }, user, function(updateErr){
								if(updateErr) {
									return cb(updateErr, null);
								}

								//now let's remove the field altogether
								collection.update({ _id: user._id }, 
									{ $unset: {
		                                passwordResetToken: ''
		                              }
                					}, function(removeErr) {
                						if(removeErr) {
											return cb(removeErr, null);
										}

										return cb(null, null);
                					}
            					);								
							});
						});
				    });
				});
			});

		}, 

		remove: function (id, callback) {
			cb('Not yet implemented', null);
		},

		validate: function(user, doSkipPassword){
			var validationErrors = [],
			validator = require('validator'); 

			if(!user.email) {
				validationErrors.push('Email required.');
			}

			if(user.email && !validator.isEmail(user.email)) {
				validationErrors.push('The email provided does not look like a valid email address.');
			}

			if(!doSkipPassword && !user.password) {
				validationErrors.push('Password required.');
			}

			return validationErrors;		
		}

	}
}

module.exports = userController;