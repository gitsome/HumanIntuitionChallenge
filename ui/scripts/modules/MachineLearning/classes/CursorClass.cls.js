(function () {

    angular.module('MachineLearning').factory('CursorClass', [

        '$rootScope',
        'SeededRandom',

        function ($rootScope, SeededRandom) {

            /*============ PRIVATE STATIC VARIABLES AND METHODS ============*/

            /*============ CLASS DECLARATION ============*/

            var CursorClass = function (text, initialCursor) {

                var that = this;

                text = text.toUpperCase();


                /*============== PRIVATE VARIABLES =============*/

                var cursor = initialCursor ? initialCursor : 0;

                var CONS = 'BCDFGHJKLMNPQRSTVWXYZ';
                var VOWELS = 'AEIOU';


                /*============== PRIVATE METHODS =============*/

                var clampCursor = function (cursorValue) {
                    return Math.max(0, Math.min(text.length - 1, cursorValue));
                };

                var replaceAt = function(index, character) {
                    return text.substr(0, index) + character + text.substr(index+character.length);
                };


                /*=============== PUBLIC NAVIGATION METHODS =============*/

                that.first = function () {
                    cursor = 0;
                    return that;
                };
                that.moveTo = function (index) {
                    cursor = clampCursor(index);
                    return that;
                };
                that.next = function () {
                    cursor = clampCursor(cursor + 1);
                    return that;
                };
                that.back = function () {
                    cursor = clampCursor(cursor - 1);
                    return that;
                };
                that.last = function () {
                    cursor = clampCursor(text.length - 1);
                    return that;
                };


                /*=============== GET AND SET =============*/

                that.get = function () {
                    return text.charAt(cursor);
                };
                that.getCharAt = function (index) {
                    return text.charAt(index);
                };
                that.getText = function () {
                    return text;
                };
                that.hasChar = function (findChar) {
                    return text.indexOf(findChar) !== -1;
                };
                that.indexOfChar = function (findChar) {
                    findChar = findChar.toUpperCase();
                    return text.indexOf(findChar);
                };

                that.set = function (newCharacter) {
                    text = replaceAt(cursor, newCharacter.toUpperCase());
                    return that;
                };


                /*=============== FIND AND LOOP =============*/

                that.forEach = function (findChar, callBack) {

                    findChar = findChar.toUpperCase();

                    var foundCursors = [];
                    for (var i=0; i < text.length; i++) {
                        if (text.charAt(i) === findChar) {
                            foundCursors.push(i);
                        }
                    }

                    _.each(foundCursors, function (foundCursor) {
                        // first make sure the character is still there, it could have changed in previous loops
                        if (text.charAt(foundCursor) === findChar) {

                            var tempCursorInstance = new CursorClass(text, foundCursor);
                            callBack.call(tempCursorInstance, tempCursorInstance, foundCursor);

                            text = tempCursorInstance.getText();
                        }
                    });

                    return that;
                };

                that.forEachVowel = function (callBack) {

                    var foundCursors = [];
                    for (var i=0; i < text.length; i++) {
                        if (VOWELS.indexOf(text.charAt(i)) !== -1) {
                            foundCursors.push(i);
                        }
                    }

                    _.each(foundCursors, function (foundCursor) {
                        // first make sure the character is still there, it could have changed in previous loops
                        if (VOWELS.indexOf(text.charAt(foundCursor)) !== -1) {

                            var tempCursorInstance = new CursorClass(text, foundCursor);
                            callBack.call(tempCursorInstance, tempCursorInstance, foundCursor);

                            text = tempCursorInstance.getText();
                        }
                    });

                    return that;
                };

                that.forEachCon = function (callBack) {

                    var foundCursors = [];
                    for (var i=0; i < text.length; i++) {
                        if (CONS.indexOf(text.charAt(i)) !== -1) {
                            foundCursors.push(i);
                        }
                    }

                    _.each(foundCursors, function (foundCursor) {
                        // first make sure the character is still there, it could have changed in previous loops
                        if (CONS.indexOf(text.charAt(foundCursor)) !== -1) {

                            var tempCursorInstance = new CursorClass(text, foundCursor);
                            callBack.call(tempCursorInstance, tempCursorInstance, foundCursor);

                            text = tempCursorInstance.getText();
                        }
                    });

                    return that;
                };


                /*=============== UTILITIY METHODS =============*/

                that.getRandomCon = function () {
                    return CONS.charAt(Math.floor(SeededRandom.random() * CONS.length));
                };

                that.getRandomVowel = function () {
                    return VOWELS.charAt(Math.floor(SeededRandom.random() * VOWELS.length));
                };


                /*=============== MORE PUBLIC PROPERTIES =============*/

                /*=============== INITIALIZTION =============*/

            };


            /*============ PUBLIC STATIC METHODS ============*/

            /*============ LISTENERS ============*/


            /*============ FACTORY INSTANCE PASSBACK ============*/

            return CursorClass;
        }
    ]);

})();


