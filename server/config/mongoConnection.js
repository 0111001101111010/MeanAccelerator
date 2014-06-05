var mongo = require('mongodb').MongoClient,
	db,
	isAlreadyConnected = function () {
		return db && db.serverConfig.isConnected();
	};

module.exports.connect = function (environmentConfig, callback) {
	var cb = callback || function() {};

	if(isAlreadyConnected()) {
		return cb(db);
	}

	mongo.connect(environmentConfig.databaseConnectionString, function(connectionErr, newDb) {
		db = newDb;
		return cb(db);
	});
};

module.exports.getDb = function (callback) {
	var cb = callback || function() {};

	if(!isAlreadyConnected()) {
		connect(function(db) {
			return cb(db); 
		});

		return;
	}

	return cb(db);
};
