module.exports = function () {

    /*============ DEPENDENCIES ============*/

    var RouteHandler = require('./RouteHandler.cls.js')();


    /*============ PRIVATE VARIABLES AND METHODS ============*/

    // re-usable filters that can be applied to all requests
    // these will return an object with status always and then if there is an error we need a code and msg
    var requestFilters = {};


    /*==================================== FACTORY CLASS DEFINITION ====================================*/

    var RequestHandler = function (filters, handler) {

        // overloading handling, if no handler, then the first param would be the handler
        if(!handler) {
            handler = filters;
            filters = [];
        }

        // here we wrap the original handler with some logic so we can run through specified request filters
        // and so we can run the handler in the context of a RouteHandler instance which gives us some convenience methods
        return function(req, res) {

            // create a new route handler and call the handler
            var routeHandler = new RouteHandler(req, res);

            // loop through fall filters
            var allFiltersPassed = true;
            for(var i=0; i < filters.length; i++) {

                var requestFilterResults = requestFilters[filters[i]](req, res);
                allFiltersPassed = allFiltersPassed && requestFilterResults.status;

                if(requestFilterResults.status !== true) {
                    routeHandler.fail(requestFilterResults.code, requestFilterResults.msg);
                    break;
                }
            }

            // if all the filters are good, then we can proceed with the original handler
            if(allFiltersPassed) {
                handler.apply(routeHandler, [req, res]);
            }

        };
    };


    /*==================================== RETURN THE FACTORY CLASS ====================================*/

    return RequestHandler;

};