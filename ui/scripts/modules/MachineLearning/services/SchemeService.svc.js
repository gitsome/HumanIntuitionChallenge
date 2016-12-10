(function () {

    angular.module('MachineLearning').service('SchemeService', [

        '$rootScope',
        '$q',
        '$timeout',
        '$http',

        function ($rootScope, $q, $timeout, $http) {

            /*============ SERVICE DECLARATION ============*/

            var SchemeService = {};


            /*============ PRIVATE METHODS AND VARIABLES ============*/

            var schemes = [];

            var updateOrCreateScheme = function (scheme) {
                return $http.post('/services/schemes', {schemeName: scheme.name, schemeTransforms: scheme.transforms}).then(function (results) {
                    return results.data;
                });
            };

            var deleteScheme = function (scheme) {
                return $http.delete('/services/schemes', {params: {schemeName: scheme.name}});
            };

            var saveData = function (mlData) {
                return $http.post('/services/savedata', mlData).then(function (results) {
                    return results;
                });
            };

            var getSchemes = function () {
                return $http.get('/services/schemes').then(function (results) {
                    schemes = results.data;
                    return schemes;
                });
            };


            /*============ SERVICE DEFINITION ============*/

            SchemeService.initialize = function (schemes_in) {
                schemes = schemes_in;
            };

            SchemeService.get = function () {
                return getSchemes();
            };

            SchemeService.updateOrCreateScheme = function (scheme) {
                return updateOrCreateScheme(scheme);
            };

            SchemeService.deleteScheme = function (scheme) {
                return deleteScheme(scheme);
            };

            SchemeService.saveData = function (data) {
                return saveData(data);
            };


            /*============ LISTENERS ============*/

            /*============ SERVICE PASSBACK ============*/

            return SchemeService;

        }
    ]);

})();