module.exports = function (appAPI) {

    /*============ DEPENDENCIES ============*/


    /*============ PRIVATE VARIABLES/METHODS ============*/

    var records = [];


    /*============ SERVICE ============*/

    var testResultsService = {};


    /*==================================== PRIVATE METHODS ====================================*/


    /*==================================== PUBLIC METHODS ====================================*/

    testResultsService.get = function () {
        return records;
    };

    testResultsService.record = function (results) {
        records.push(results);
    };


    /*============ RETURN THE SERVICE ============*/

    return testResultsService;

};