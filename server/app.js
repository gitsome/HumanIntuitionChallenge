(function() {

    /*============ LOAD ENVIRONMENT CONFIGS ============*/

    /*============ MAIN REQUIRED LIBRARIES ============*/

    var Promise = require("bluebird");
    var path = require('path');                 // path utilities

    var express = require('express');
    var http = require('http');                 // express wraps http, but we need a low level reference for socket.io
    var request = require('request');           // request wraps http for a simpler http api
    var session = require('express-session')    // in memory session ids

    var bodyParser = require('body-parser');
    var methodOverride = require('method-override');

    var errorHandler = require('errorhandler');


    /*============ GLOBALS ============*/

    global.appRoot = path.resolve(__dirname);


    /*============ DEBUG LOGGING / ERROR HANDLING ============*/

    require('colors').setTheme({
        "silly": 'rainbow',
        "input": 'grey',
        "verbose": 'cyan',
        "prompt": 'grey',
        "success": 'green',
        "info": 'green',
        "data": 'grey',
        "help": 'cyan',
        "warn": 'yellow',
        "debug": 'blue',
        "error": 'red'
    });


    /*============ PRIVATE VARIABLES ============*/

    // the main app object
    var app = express();

    // reference to the server object
    var server;

    // create the appAPI object to share with http routes, services
    var appAPI = {

        // services
        services: {}
    };


    /*============ SHUTDOWN METHOD ============*/

    var shutdownNode = function (err) {

        console.log("");
        console.log("");
        console.log("stopping node...".cyan);

        if(err) {
            console.log(err.stack);
        }

        // stop this node process
        console.log("    ...node stopped".green);
        process.exit(0);
    };


    /*============ APP SERVER CONFIGURATION ============*/

    var configureApplicationServer = function (routeAPI) {

        // views and rendering engine
        app.set('views', __dirname + '/views');
        app.set('view engine', 'hjs');

        // simple sessions
        app.use(session({
          secret: 'machinelearning',
          resave: false,
          saveUninitialized: true
        }));

        // favicon, errorHandling
        app.use(errorHandler({ dumpExceptions: true, showStack: true }));

        // handle rest calls
        app.use(methodOverride());

        // body parsing and friendlier put and get
        app.use(bodyParser.urlencoded({ extended: true, limit: '50mb'}));
        app.use(bodyParser.json({limit: '50mb'}));

        // create a static server with the root at the ui directory
        app.use('/', express.static(path.join(__dirname, '../ui')));

        // after we have taken sessions and the static server into account we can do routes
        require('./routes/route_rest.js')(app, routeAPI);

        // all other requests for routing
        require('./routes/route_root.js')(app, routeAPI);
    };


    /*============ SERVICE LAYER API ============*/

    // these are singleton services that require the apiAPI
    var loadServices = function () {

        return new Promise(function(resolve, reject) {

            // order matters if you have dependencies amongst the services TODO (Implement a dependency injection system so this is done automatically)
            appAPI.services['schemes'] = require('./services/schemes.svc.js')(appAPI);

            appAPI.services['mode'] = require('./services/mode.svc.js')(appAPI);

            appAPI.services['mlData'] = require('./services/mlData.svc.js')(appAPI);

            appAPI.services['testResults'] = require('./services/testResults.svc.js')(appAPI);

            resolve();
        });
    };


    /*============ START THE SERVER ============*/

    var startNode = function () {
        return new Promise(function(resolve, reject){
            console.log("...starting node".green);
            resolve();
        });
    };

    var startAppServer = function () {

        console.log("...starting app server".green);

        return new Promise(function(resolve, reject) {
            server = http.createServer(app);

            // create the routeAPI (routes typically only interface with the services and templating)
            var routeAPI = {
                services: appAPI.services           // the services used within the routes (services have access to the appAPI)
            };

            // configure all the routes for the application server
            configureApplicationServer(routeAPI);

            // start listenting
            app.set('port', 3000);
            server.listen(app.get('port'), function() {
                console.log("express server listening on port: ".green + ("" + app.get('port')).cyan);
            });

            resolve(true);
        });
    };


    /*============ INITIALIZE AND DATA REQUIRED =============*/

    var loadInitData = function () {
        return appAPI.services.schemes.hydrate();
    };


    /*============ START NODE COMPLETE ============*/

    var startNodeComplete = function () {
        console.log("...node started".green);
        console.log("");
    };


    /*============ WEB SERVICES INITIALIZATION ============*/

    startNode()

        // load all required services
        .then(loadServices)

        // lastly make sure any intial data is loaded (very useful during first deployment and testing)
        .then(loadInitData)

        // now start the app server!!! This will wire up all the request handling logic including routes
        .then(startAppServer)

        // and we are done!!
        .then(startNodeComplete, shutdownNode);


    /*============ ADDITIONAL INITIALIZATION ============*/

    process.on('SIGINT', shutdownNode);

})();