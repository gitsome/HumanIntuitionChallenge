module.exports = function (appAPI) {

    /*============ DEPENDENCIES ============*/


    /*============ PRIVATE VARIABLES/METHODS ============*/

    // 'view' OR 'edit'
    var currentMode = 'edit';


    /*============ SERVICE ============*/

    var ModeService = {};


    /*==================================== PRIVATE METHODS ====================================*/


    /*==================================== PUBLIC METHODS ====================================*/

    ModeService.get = function () {
        return currentMode;
    };

    ModeService.set = function (mode) {
        return currentMode = mode;
    };


    /*============ RETURN THE SERVICE ============*/

    return ModeService;

};