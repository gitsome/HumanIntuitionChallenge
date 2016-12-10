(function () {

    angular.module('MachineLearning').service('StringTransformService', [

        'CursorClass',
        'SeededRandom',

        function (CursorClass, SeededRandom) {

            /*============ SERVICE DECLARATION ============*/

            var StringTransformService = {};


            /*============ PRIVATE METHODS AND VARIABLES ============*/

            var STRING_LENGTH = 7;

            var getRandomString = function (stringLength, useRealRandom) {

                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

                var randomNum;
                for( var i=0; i < stringLength; i++) {
                    randomNum = useRealRandom ? Math.random() : SeededRandom.random();
                    text += possible.charAt(Math.floor(randomNum * possible.length));
                }

                return text;
            };

            var transformString = function (stringValue, transforms) {

                var cursor = new CursorClass(stringValue);

                var foundError = false;

                _.each(transforms, function (transform) {
                    cursor.first();

                    transform.error = false;

                    try {
                        eval(transform.script);
                    } catch (e) {
                        transform.error = e.toString();
                        foundError = true;
                    }
                });

                if (!foundError) {
                    return cursor.getText();
                } else {
                    return 'ERROR';
                }
            };

            var beforeString;
            var afterString;
            var hasChanged;
            var getRandomStringTransformPair = function (transforms, useRealRandom) {

                beforeString = getRandomString(STRING_LENGTH, useRealRandom);
                afterString = transformString(beforeString, transforms);
                hasChanged = beforeString !== afterString && afterString !== 'ERROR';

                return {
                    before: beforeString,
                    after: afterString,
                    hasChange: hasChanged
                };
            };


            /*============ SERVICE DEFINITION ============*/

            StringTransformService.getRandomStringFromTransforms = function (transforms) {

                var currentStringTransformPair;
                var hasFoundModifiedString = false;
                var currentAttempt = 0;
                var MAX_ATTEMPTS = 300;

                while (currentAttempt < MAX_ATTEMPTS && !hasFoundModifiedString) {

                    currentStringTransformPair = getRandomStringTransformPair(transforms, true);

                    hasFoundModifiedString = currentStringTransformPair.hasChange;

                    currentAttempt++;
                }

                return currentStringTransformPair.after;
            };

            StringTransformService.generateStringTransformPairsData = function (transforms, count) {

                SeededRandom.reset();

                var transformPairs = [];

                var totalChanged = 0;

                var currentRandomStringTransformPair;
                for (var i=0; i < count; i++) {

                    currentRandomStringTransformPair = getRandomStringTransformPair(transforms);

                    if (currentRandomStringTransformPair.hasChange) {
                        totalChanged++;
                    }

                    transformPairs.push(currentRandomStringTransformPair);
                }

                return {
                    transformPairs: transformPairs,
                    percentChanged: totalChanged ? Math.round((totalChanged / transformPairs.length) * 100) : 0
                };
            };

            /*============ LISTENERS ============*/

            /*============ SERVICE PASSBACK ============*/

            return StringTransformService;
        }
    ]);

})();

