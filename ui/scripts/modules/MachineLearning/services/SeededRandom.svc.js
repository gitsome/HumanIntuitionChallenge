
var SeededRandom = SeededRandom || {};

(function () {

    angular.module('MachineLearning').service('SeededRandom', [

        '$localStorage',

        function ($localStorage) {

            /*============ SERVICE DECLARATION ============*/

            var SeededRandomService = {};


            /*============ PRIVATE METHODS AND VARIABLES ============*/

            var currentSeededRandom;

            var setCurrentSeededRandom = function () {
                currentSeededRandom = new SeededRandom($localStorage.seededRandom);
            };

            var setNewSeed = function () {
                $localStorage.seededRandom = Math.round(Math.random() * 999999999999);
                setCurrentSeededRandom();
            };

            var initialize = function () {

                if (!$localStorage.seededRandom) {
                    setNewSeed();
                } else {
                    setCurrentSeededRandom();
                }
            };



            /*============ SERVICE DEFINITION ============*/

            SeededRandomService.random = function () {
                return currentSeededRandom.random();
            };

            SeededRandomService.reset = function () {
                setCurrentSeededRandom();
            };

            SeededRandomService.setNewSeed = function () {
                setNewSeed();
            };


            /*============ LISTENERS ============*/



            /*============ INITIALIZE ==============*/

            initialize();


            /*============ SERVICE PASSBACK ============*/

            return SeededRandomService;
        }
    ]);

})();

