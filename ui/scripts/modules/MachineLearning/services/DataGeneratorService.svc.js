(function () {

    angular.module('MachineLearning').service('DataGeneratorService', [

        '$rootScope',
        '$q',
        '$timeout',
        'StringTransformService',

        function ($rootScope, $q, $timeout, StringTransformService) {

            /*============ SERVICE DECLARATION ============*/

            var DataGeneratorService = {};


            /*============ PRIVATE METHODS AND VARIABLES ============*/

            // should be set to the average number of questions it took a human to do for comparison
            // (NOTE) multiply by 2 so half can be used for testing
            var DATA_POINTS_PER_SCHEME = 150;

            var fillArray = function (len, val) {
                var rv = new Array(len);
                while (--len >= 0) {
                    rv[len] = val;
                }
                return rv;
            };

            var alphabet = {A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:11,L:12,M:13,N:14,O:15,P:16,Q:17,R:18,S:19,T:20,U:21,V:22,W:23,X:24,Y:25,Z:26};

            var getOneHotArrayForChar = function (character) {

                var characterIndex = alphabet[character] - 1;
                var oneHotArray = fillArray(26, 0);
                oneHotArray[characterIndex] = 1;

                return oneHotArray;
            };

            var charsToOneHot = function (chars) {

                var characterOneHotData = [];

                var oneHotArray;
                for (var i=0; i < chars.length; i++) {
                    characterOneHotData = characterOneHotData.concat(getOneHotArrayForChar(chars[i]));
                }

                return characterOneHotData;
            };

            var getTotalDataPoints = function (schemes) {
                return schemes.length * DATA_POINTS_PER_SCHEME;
            };

            var getRandomScheme = function (schemes) {
                return schemes[Math.floor(Math.random() * schemes.length)];
            };

            var generateData = function (schemes) {

                var totalDataPoints = getTotalDataPoints(schemes);

                var labelIndexToLabelMap = {};
                var labelToLableIndexMap = {};
                _.each(schemes, function (scheme, i) {
                    labelIndexToLabelMap[i] = scheme.name;
                    labelToLableIndexMap[scheme.name] = i;
                });

                var mlData = [];

                var thisScheme;
                var randomString;
                for (var i=0; i < totalDataPoints; i++) {

                    thisScheme = getRandomScheme(schemes);

                    randomString = StringTransformService.getRandomStringFromTransforms(thisScheme.transforms);

                    mlData.push({
                        value: randomString,
                        oneHotValue: charsToOneHot(randomString),
                        label: labelToLableIndexMap[thisScheme.name]
                    });
                }

                return {labelMap: labelIndexToLabelMap, data: mlData};
            };


            /*============ SERVICE DEFINITION ============*/

            DataGeneratorService.generateData = function (schemes) {
                var deferred = $q.defer();

                $timeout(function () {

                    var data = generateData(schemes);

                    $timeout(function () {

                        deferred.resolve(data);

                    }, 300);

                }, 500);

                return deferred.promise;
            };


            /*============ LISTENERS ============*/

            /*============ SERVICE PASSBACK ============*/

            return DataGeneratorService;

        }
    ]);

})();