module.exports = function(app, routeAPI){

    /*============ DEPENDENCIES ============*/

    var RequestHandler = require('../classes/RequestHandler.cls.js')();
    var jsonfile = require('jsonfile');

    var _ = require('underscore');


    /*============ PRIVATE VARIABLES/METHODS ============*/

    var services = routeAPI.services;


    /*==================================== SET MODE ====================================*/

    app.get("/services/mode/edit", RequestHandler(function (req, res) {

        var that = this;

        /*============ RESPONSE LOGIC ============*/

        services.mode.set('edit');

        that.success({status: 'success'});
    }));

    app.get("/services/mode/view", RequestHandler(function (req, res) {

        var that = this;

        /*============ RESPONSE LOGIC ============*/

        services.mode.set('view');

        that.success({status: 'success'});
    }));


    /*==================================== SET DEFAULT SCHEMES ====================================*/

    app.get("/services/setdefaultschemes", RequestHandler(function (req, res) {

        var that = this;

        /*============ RESPONSE LOGIC ============*/

        services.schemes.setDefaultSchemes();

        that.success({status: 'success'});
    }));


    /*==================================== GET SCHEMES ====================================*/

    app.get("/services/schemes", RequestHandler(function (req, res) {

        var that = this;

        /*============ RESPONSE LOGIC ============*/

        that.success(services.schemes.get());
    }));


    /*==================================== CREATE or UPDATE SCHEME ====================================*/

    app.post("/services/schemes", RequestHandler(function (req, res) {

        var that = this;

        /*============ GATHER PARAMS ============*/

        var query = req.query;
        var params = req.params;
        var body = req.body;

        var schemeName = body.schemeName;
        var schemeTransforms = body.schemeTransforms;

        var updatedScheme = services.schemes.updateOrCreateScheme(schemeName, schemeTransforms);


        /*============ RESPONSE LOGIC ============*/

        that.success(updatedScheme);
    }));


    /*==================================== DELETE SCHEME ====================================*/

    app.delete("/services/schemes", RequestHandler(function (req, res) {

        var that = this;

        /*============ GATHER PARAMS ============*/

        var query = req.query;

        var schemeName = query.schemeName;

        services.schemes.deleteScheme(schemeName);


        /*============ RESPONSE LOGIC ============*/

        that.success({status: 'success'});
    }));


    /*==================================== SAVE ML DATA ====================================*/

    app.post("/services/savedata", RequestHandler(function (req, res) {

        var that = this;

        /*============ GATHER PARAMS ============*/

        var query = req.query;
        var params = req.params;
        var mlData = req.body;

        services.mlData.save(mlData);


        /*============ RESPONSE LOGIC ============*/

        that.success({status: 'success'});
    }));

    /*==================================== GET ML DATA ====================================*/

    app.get("/services/getdata", RequestHandler(function (req, res) {

        var that = this;

        /*============ GATHER PARAMS ============*/

        var file = global.appRoot + '/exports/mlData.json';

        /*============ RESPONSE LOGIC ============*/

        try {
            var mlData = jsonfile.readFileSync(file);
            that.success(mlData);
        } catch (e) {
            console.log("error getting data", e);
            that.fail("error getting data");
        }

    }));

    /*==================================== SAVE TEST RESULTS ====================================*/

    app.post("/services/results", RequestHandler(function (req, res) {

        var that = this;

        /*============ GATHER PARAMS ============*/

        var query = req.query;
        var params = req.params;
        var testResults = req.body;

        services.testResults.record({
            sessionId: req.session.id,
            testResults: testResults,
            date: new Date().getTime()
        });

        var records = services.testResults.get();
        var passed = _.filter(records, function (record) {
            return record.testResults.passed === 'TRUE';
        });

        var passedPercent = records.length ? (passed.length/records.length) : 0;

        var averagePassedQuestions = 0;

        if (passed.length) {

            var runningTotal = _.reduce(passed, function (memo, passedRecord) {
                return memo + passedRecord.testResults.questions;
            }, 0);

            averagePassedQuestions = runningTotal / passed.length;
        }


        /*============ RESPONSE LOGIC ============*/

        that.success({
            totalRecords: records.length,
            passedRecords: passed.length,
            averagePassedQuestions: averagePassedQuestions
        });

    }));

    app.get("/services/results", RequestHandler(function (req, res) {

        var that = this;

        /*============ GATHER PARAMS ============*/


        /*============ RESPONSE LOGIC ============*/

        that.success(services.testResults.get());
    }));

};