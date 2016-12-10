
// we will wrap moment in this service
var moment = moment || {};

(function () {

    /**
     * Wrapper for Moment.js
     */

    angular.module('MachineLearning').service('Moment', [

        function () {

            /*============ SERVICE DECLARATION ============*/

            var MomentService;


            /*============ PRIVATE METHODS AND VARIABLES ============*/


            /*============ SERVICE DEFINITION ============*/

            MomentService = moment;

            /*============ LISTENERS ============*/

            /*============ SERVICE PASSBACK ============*/

            return MomentService;
        }
    ]);

})();

