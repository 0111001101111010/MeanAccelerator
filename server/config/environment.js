// Configuration
var path = require('path');

var config = {
    development: {
        name: 'development',
        useHttps: false,
        clientPath: path.resolve('client'),
        databaseConnectionString: 'mongodb://127.0.0.1:27017/MeanAccelerator',
        fromEmail: 'email@yourcompany.com',
        webmasterEmail: 'email@yourcompany.com'
    },
    production: {
        name: 'production',
        useHttps: false,
        clientPath: path.resolve('client'),
        databaseConnectionString: 'TBD',
        fromEmail: 'email@yourcompany.com',
        webmasterEmail: 'email@yourcompany.com'
    }
};

module.exports = config;