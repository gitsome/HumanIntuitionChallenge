(function () {

    angular.module('MachineLearning').service('TestResultsService', [

        '$rootScope',
        '$q',
        '$timeout',
        '$http',

        function ($rootScope, $q, $timeout, $http) {

            /*============ SERVICE DECLARATION ============*/

            var TestResultsService = {};


            /*============ PRIVATE METHODS AND VARIABLES ============*/

            var saveResults = function (testResults) {
                return $http.post('/services/results', testResults).then(function (results) {
                    return results.data;
                });
            };


            /*============ SERVICE DEFINITION ============*/

            TestResultsService.saveResults = function (results) {
                return saveResults(results);
            };


            /*============ LISTENERS ============*/

            /*============ SERVICE PASSBACK ============*/

            return TestResultsService;

        }
    ]);

})();