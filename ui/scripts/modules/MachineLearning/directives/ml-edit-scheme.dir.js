(function () {

    angular.module('MachineLearning').directive('mlEditScheme', function () {

        return {

            restrict: 'E',

            scope: {
                scheme: '='
            },

            controller: [

                '$scope',
                '$element',
                'StringTransformService',
                'SeededRandom',

                function ($scope, $element, StringTransformService, SeededRandom) {

                    /*============ MODEL ============*/

                    $scope.transformedExamplesData = {
                        transformPairs: [],
                        percentChanged: 0
                    };


                    /*============ MODEL DEPENDENT METHODS ============*/

                    var updateTransformedExamplesData = function () {
                        $scope.transformedExamplesData = StringTransformService.generateStringTransformPairsData($scope.scheme.transforms, 50);
                    };

                    var debounced_updateTransformedExamplesData = _.debounce(function () {
                        updateTransformedExamplesData();
                        $scope.$apply();
                    }, 100);

                    var deleteTransform = function (transformToDelete) {

                        var foundIndex = -1;
                        _.each($scope.scheme.transforms, function (transform, i) {
                            if (transform === transformToDelete) {
                                foundIndex = i;
                            }
                        });

                        if (foundIndex !== -1) {
                            $scope.scheme.transforms.splice(foundIndex, 1);
                        }

                        debounced_updateTransformedExamplesData();
                    };


                    /*============ BEHAVIOR ============*/

                    $scope.done = function () {
                        $scope.$emit('ml-edit-scheme.done');
                    };

                    $scope.addTransform = function () {

                        $scope.scheme.transforms.push({
                            script: ''
                        });
                    };

                    $scope.refreshTransformations = function () {
                        SeededRandom.setNewSeed();
                        updateTransformedExamplesData();
                    };

                    $scope.progressBarClass = function () {
                        return {
                            'progress-bar-danger': $scope.transformedExamplesData.percentChanged < 75,
                            'progress-bar-warning': $scope.transformedExamplesData.percentChanged < 95,
                            'progress-bar-success': $scope.transformedExamplesData.percentChanged >= 95
                        };
                    };


                    /*============ LISTENERS ============*/

                    $scope.$on('ml-scheme-transform.scriptChanged', debounced_updateTransformedExamplesData);

                    $scope.$on('ml-scheme-transform.delete', function (e, transform) {
                        deleteTransform(transform);
                    });


                    /*============ INITIALIZATION ============*/

                    debounced_updateTransformedExamplesData();
                }
            ],

            template: [

                '<div class="row">',
                    '<div class="col-xs-12">',

                        '<div class="row view-title">',

                            '<div class="col-xs-9">',
                                '<h2>Editing Scheme "<span class="emphasize">{{scheme.name}}</span>"</h2>',
                            '</div>',

                            '<div class="col-xs-3 text-right">',
                                '<button class="btn btn-primary" ng-click="done()"><i class="fa fa-check"></i> Done</button>',
                            '</div>',

                        '</div>',

                        '<div class="row">',

                            '<div class="col-xs-8">',

                                '<ng-form name="schemeForm">',

                                    '<div class="form-section">',
                                        '<div class="row">',

                                            '<div class="col-xs-12">',
                                                '<label for="scheme-transforms">Scheme Transforms</label>',
                                            '</div>',

                                        '</div>',

                                        '<div class="row">',
                                            '<div class="col-xs-12">',

                                                '<div class="empty-stuff" ng-if="!scheme.transforms.length">',
                                                    'No transforms have been added yet...',
                                                '</div>',

                                                '<div>',
                                                    '<ml-scheme-transform class="anim-el-slide-left" ng-repeat="transform in scheme.transforms" transform="transform"></ml-scheme-transform>',
                                                '</div>',

                                                '<div class="text-right control-box">',

                                                    '<button class="btn btn-primary" ng-click="addTransform()" ng-disabled="creating">',
                                                        '<i class="fa fa-plus"></i>',
                                                        ' Add A Transform',
                                                    '</button>',

                                                '</div>',

                                            '</div>',
                                        '</div>',

                                    '</div>',

                                    '<div class="form-section">',
                                        '<div class="row">',

                                            '<div class="col-xs-12">',
                                                '<label for="scheme-transforms">Scheme Transform Examples (use cursor object)</label>',
                                            '</div>',

                                        '</div>',

                                        '<div class="row">',
                                            '<div class="col-xs-12">',

'<pre>cursor.set("W"); // set the character to "W" at the current position</pre>',

'<pre>cursor.get(); // get the value at the current position</pre>',

'<pre>cursor.getCharAt(5); // get the character at the specified index</pre>',

'<pre>cursor.getRandomVowel() // utility: get a random vowel</pre>',

'<pre>cursor.getRandomCon() // utility: get a random consonant</pre>',

'<pre>cursor.next(); // move the cursor forward</pre>',
'<pre>cursor.back(); // move the cursor back</pre>',
'<pre>cursor.first(); // move the cursor to the beginning</pre>',
'<pre>cursor.last(); // move the cursor to the end</pre>',
'<pre>cursor.moveTo(); // move cursor to a particular index</pre>',

'<pre>// for each "P", make sure an "S" follows\n',
'cursor.forEach("P", function (c, i) {\n',
'    c.next().set("S");\n',
'});',
'</pre>',

'<pre>// for each vowel, if it occurs after the middle replace it with a random consonant\n',
'cursor.forEachVowel(function (c, i) {\n',
'    if (i > 4) {\n',
'        c.next().set(c.getRandomCon());\n',
'    }\n',
'});',
'</pre>',
'<pre>// for each consonant (con), if it is not a member of "JOHN", then\n',
'cursor.forEachCon(function (c, i) {\n',
'    if ("JOHN".indexOf(c.get()) === -1) {\n',
'        c.set(c.getRandomVowel());\n',
'    }\n',
'});',
'</pre>',

                                            '</div>',
                                        '</div>',

                                    '</div>',


                                '</ng-form>',

                            '</div>',

                            '<div class="col-xs-4">',

                                '<div class="form-section">',

                                    '<div class="row">',
                                        '<div class="col-xs-10">',
                                            '<label for="scheme-transforms">Transformations</label>',
                                        '</div>',
                                        '<div class="col-xs-2 text-right noselect">',
                                            '<i class="fa fa-refresh ml-edit-scheme-refresh" ng-click="refreshTransformations()"></i>',
                                        '</div>',
                                    '</div>',

                                    '<div class="well">',

                                        '<div class="row">',

                                            '<div class="col-xs-12">',
                                                '<div class="progress ml-edit-scheme-percent-change">',
                                                    '<div class="progress-bar" ng-class="progressBarClass()" role="progressbar" style="width: {{transformedExamplesData.percentChanged}}%;">',
                                                        '<span>{{transformedExamplesData.percentChanged}}%</span>',
                                                    '</div>',
                                                '</div>',
                                            '</div>',

                                        '</div>',

                                        '<div class="row">',

                                            '<div class="col-xs-12 text-center">',

                                                '<div class="example-string" ng-repeat="transformedPair in transformedExamplesData.transformPairs" ng-class="{\'example-string-has-change\': transformedPair.hasChange}">',
                                                    '<span class="example-string-before">{{transformedPair.before}}</span> ',
                                                    '<i class="fa fa-arrow-right"></i> ',
                                                    '<span class="example-string-after">{{transformedPair.after}}</span>',
                                                '</div>',

                                            '</div>',

                                        '</div>',

                                    '</div>',
                                '</div>',

                            '</div>',
                        '</div>',

                    '</div>',
                '</div>'

            ].join('')
        };
    });

})();