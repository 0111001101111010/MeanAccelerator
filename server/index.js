/*jslint node: true*/
'use strict';

var express = require('express'),
    app = express(),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    routes = require('./routes'),
    environment = process.env.NODE_ENV || 'development',
    environmentConfig = require('./config/environment')[environment],
    mongoConnection = require('./config/mongoConnection'),
    port = process.env.PORT || 8080;

    // TODO: HTTPS support

module.exports.start = function () {
    //global Mongo connection
    mongoConnection.connect(environmentConfig);

    require('./config/passport')(passport, mongoConnection);
    app.use(express.static(environmentConfig.clientPath));
    app.use(express.logger('dev'));
    app.use(express.cookieParser());    //needed for auth
    app.use(express.bodyParser());      //needed to read post data
    app.use(express.compress());
    app.use(express.session({ secret: 'keyboard secret dog' }));
    app.use(passport.initialize());
    app.use(passport.session());

    routes(app, environmentConfig, mongoConnection);

    app.listen(port);
    console.log("Now listening on port %d", port);
}