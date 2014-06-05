'use strict';

function controller(environmentConfig) {
	var mandrillConfig = require('../config/mandrill'),
		mandrill = require('node-mandrill')(mandrillConfig.apiKey);

	return {
		sendEmail: function (to, subject, body) {
			var toSend = to, 
			subjectSend = subject, 
			bodySend = body;

			if(environmentConfig.name === 'development') {
				toSend = environmentConfig.webmasterEmail;
				subjectSend = 'TEST: ' + subjectSend;
				bodySend = 'THIS TEST WAS ORIGINALLY SENT TO: ' + to + '\r\n<hr/>' + body;
			}

			var messageSend = {
				to: [{ email: toSend }],
				from_email: environmentConfig.fromEmail,
				subject: subjectSend,
				html: bodySend
			};

			mandrill('/messages/send', {
				message: messageSend
			}, function(err, response) {
			    if (err) {
			    	return console.log( JSON.stringify(err) );
			    }
			});
		}
	}
}

module.exports = controller;




