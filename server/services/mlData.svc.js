module.exports = function (appAPI) {

    /*============ DEPENDENCIES ============*/

    var jsonfile = require('jsonfile');


    /*============ PRIVATE VARIABLES/METHODS ============*/

    /*============ SERVICE ============*/

    var MLDataService = {};


    /*==================================== PRIVATE METHODS ====================================*/


    /*==================================== PUBLIC METHODS ====================================*/

    MLDataService.save = function (mlData) {
        var file = global.appRoot + '/exports/mlData.json';
        jsonfile.writeFileSync(file, mlData);
    };


    /*============ RETURN THE SERVICE ============*/

    return MLDataService;

};