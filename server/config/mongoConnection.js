function controller(environmentConfig) {

	var mongo = require('mongodb').MongoClient,
		db,

		isAlreadyConnected = function () {
			var isConnected = !!(db && db.serverConfig.isConnected());
			return isConnected;
		},

		connectFunction = function (callback) {
			var cb = callback || function() {};

			if(isAlreadyConnected()) {
				return cb(db);
			}

			mongo.connect(environmentConfig.databaseConnectionString, function(connectionErr, newDb) {
				console.log('Mongo: now connected');
				db = newDb;
				return cb(db);
			});
		};

	return {

		getDb: function (callback) {
			var cb = callback || function() {};

			if(!isAlreadyConnected()) {
				connectFunction(function(db) {
					return cb(db);
				});

				return;
			}

			return cb(db);
		},

		closeDb: function() {
			if(db) {
				db.close();
			}
		}

	}
}

module.exports = controller;