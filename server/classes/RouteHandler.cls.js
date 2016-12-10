module.exports = function () {

    /*============ DEPENDENCIES ============*/

    /*============ PRIVATE VARIABLES AND METHODS ============*/

    /*==================================== FACTORY CLASS DEFINITION ====================================*/

    var RouteHandler = function (req, res) {

        var that = this;

        that.success = function (message) {
            res.status(200).send(message);
        };

        that.fail = function (code, message) {
            res.status(code).send(message);
        };
    };


    /*==================================== RETURN THE FACTORY CLASS ====================================*/

    return RouteHandler;

};