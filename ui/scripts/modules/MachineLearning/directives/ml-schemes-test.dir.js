(function () {

    angular.module('MachineLearning').directive('mlSchemesTest', function () {

        return {

            restrict: 'E',

            scope: {},

            controller: [

                '$scope',
                '$element',
                '$timeout',
                'Moment',
                'SchemeService',
                'StringTransformService',
                'TestResultsService',

                function ($scope, $element, $timeout, Moment, SchemeService, StringTransformService, TestResultsService) {

                    /*============ PRIVATE VARIABLES =============*/

                    var schemes = [];

                    var MAX_QUESTIONS = null;

                    var INTERVAL_PERCENT_CORRECT = 80; // this also needs to scale with the number of schemes

                    var INTERVAL_CORRECT = null;

                    var transitionTimeout = false;


                    /*============ MODEL ============*/

                    $scope.testComplete = false;

                    $scope.maxTries = MAX_QUESTIONS;
                    $scope.intervalLength;
                    $scope.percentThreshold = INTERVAL_PERCENT_CORRECT;

                    $scope.showingInstructions = true;

                    $scope.currentQuestionIndex = 0;
                    $scope.currentQuestion;
                    $scope.schemeOptionSelected = false;

                    $scope.questionLoading = false;

                    $scope.currentIntervalPercentCorrect = 0;
                    $scope.maxIntervalCorrectPercent = 0;

                    $scope.schemeOptions = null;
                    $scope.schemesCount = null;

                    $scope.answers = [];

                    $scope.passed = 'FALSE';


                    /*============ MODEL DEPENDENT METHODS ============*/

                    var loadSchemes = function () {

                        return SchemeService.get().then(function (schemes_in) {

                            schemes = schemes_in;

                            $scope.schemeOptions = _.map(schemes, function (scheme) {
                                return {
                                    name: scheme.name,
                                    transformCount: scheme.transforms.length
                                };
                            });

                            $scope.schemesCount = schemes.length;

                            MAX_QUESTIONS = schemes.length * 40;    // I think this should be some type of exponential... would get progressively harder with more

                            INTERVAL_CORRECT = schemes.length * 10; // this would be a good number to research based off the machine learning results (should represent the minimum number of questions before improvement starts)

                            $scope.intervalLength = INTERVAL_CORRECT;
                        });
                    };

                    var loadFakeAnswers = function () {

                        $scope.testComplete = true;

                        $scope.passed = 'TRUE';

                        var randomNum;

                        var hasReached = false;
                        var successWeight = 0;
                        var successTarget = INTERVAL_CORRECT;

                        var MAX_LEARNING_NUMBER = Math.max(successTarget, INTERVAL_CORRECT * 2);

                        var getCompletelyRandomScore = function () {
                            randomNum = Math.round(Math.random() * ($scope.schemesCount - 1));
                            return randomNum === 0 ? 1 : 0;
                        };

                        // a score that simulates learning over time and the approaching of the expected INTERVAL_PERCENT_CORRECT needed
                        var getRandomScore = function () {

                            // return getCompletelyRandomScore();

                            if ($scope.answers.length > successTarget) {

                                // successWeight will increase from 0 to 1 as it goes MAX_LEARNING_NUMBER beyond the successTarget
                                successWeight = Math.min(1, ($scope.answers.length-successTarget) / MAX_LEARNING_NUMBER);
                                randomNum = Math.round(Math.random() * (1 - ((INTERVAL_PERCENT_CORRECT * successWeight)/ 100)));
                                return randomNum === 0 ? 1 : 0;

                            } else {
                                return getCompletelyRandomScore();
                            }
                        };

                        var currentAnswer = 0;

                        while (!hasReached && currentAnswer < MAX_QUESTIONS) {
                            $scope.answers.push(getRandomScore());
                            hasReached = getHasUserReachedSuccessPercent();
                            currentAnswer++;
                        }
                    };

                    var getRandomScheme = function () {
                        return schemes[Math.floor(Math.random() * schemes.length)];
                    };

                    var getHasUserReachedSuccessPercent = function () {

                        if (($scope.answers.length - 1) <= INTERVAL_CORRECT) {
                            $scope.currentIntervalPercentCorrect = 0;
                            return false;
                        }

                        var lastAnswerSet = $scope.answers.slice(($scope.answers.length - 1) - (INTERVAL_CORRECT - 1), ($scope.answers.length - 1));

                        var totalCorrect = _.reduce(lastAnswerSet, function (memo, answer) {
                            return memo + answer;
                        }, 0);

                        $scope.currentIntervalPercentCorrect = Math.round((totalCorrect* 100)/INTERVAL_CORRECT);

                        // track the hightest interval correctness in case they don't pass within the max ammount of questions alloted
                        $scope.maxIntervalCorrectPercent = Math.max($scope.maxIntervalCorrectPercent, $scope.currentIntervalPercentCorrect);

                        var hasProperIntervalPercent = $scope.currentIntervalPercentCorrect >= INTERVAL_PERCENT_CORRECT;

                        // we should leave on a win
                        var lastAnswerWasCorrect = $scope.answers[$scope.answers.length - 1] === 1;

                        return hasProperIntervalPercent && lastAnswerWasCorrect;
                    };

                    var getRandomSchemeString = function (scheme) {
                        return StringTransformService.getRandomStringFromTransforms(scheme.transforms);
                    };

                    var getNextQuestion = function () {

                        var randomScheme = getRandomScheme();

                        return {
                            questionString: getRandomSchemeString(randomScheme),
                            correctAnswer: randomScheme.name
                        };
                    };

                    var loadNextQuestion = function () {

                        $scope.questionTransitionOn = false;
                        $timeout.cancel(transitionTimeout);

                        $scope.questionLoading = true;
                        $scope.schemeOptionSelected = false;

                        $scope.currentQuestionIndex++;

                        if ($scope.currentQuestionIndex > MAX_QUESTIONS) {
                            $scope.questionLoading = false;
                            $scope.testComplete = true;
                            return;
                        }

                        hasHitSuccess = getHasUserReachedSuccessPercent();

                        if (hasHitSuccess) {
                            $scope.questionLoading = false;
                            $scope.testComplete = true;
                            $scope.passed = 'TRUE';
                            return;
                        }

                        $scope.currentQuestion = getNextQuestion();

                        $timeout(function () {
                            $scope.questionLoading = false;
                        }, 300);
                    };

                    var startQuestionTransition = function () {
                        $scope.questionTransitionOn = true;
                        transitionTimeout = $timeout(loadNextQuestion, 1000);
                    };


                    /*============ BEHAVIOR ============*/

                    $scope.nextPlease = function () {
                        if ($scope.schemeOptionSelected) {
                            loadNextQuestion();
                        }
                    };

                    $scope.startTest = function () {
                        $scope.showingInstructions = false;
                    };

                    $scope.chooseScheme = function (schemeOption) {

                        // don't allow people to click twice once they have made a selection
                        if ($scope.schemeOptionSelected) {
                            return;
                        }

                        $scope.schemeOptionSelected = schemeOption;

                        $scope.isCorrect = ($scope.currentQuestion.correctAnswer === $scope.schemeOptionSelected.name);

                        $scope.answers.push(($scope.isCorrect ? 1 : 0));

                        startQuestionTransition();
                    };


                    /*============ LISTENERS ============*/

                    $scope.$watch('testComplete', function (isComplete) {
                        if (isComplete) {
                            TestResultsService.saveResults({
                                passed: $scope.passed,
                                questions: $scope.answers.length,
                                maxIntervalCorrectPercent: $scope.maxIntervalCorrectPercent
                            });
                        }
                    });


                    /*============ INITIALIZATION ============*/

                    $scope.questionLoading = true;

                    loadSchemes().then(function () {

                        //loadFakeAnswers();
                        loadNextQuestion();
                    });
                }
            ],

            template: [

                '<div ng-if="showingInstructions" class="ml-schemes-test-instructions">',

                    '<h2>Human Intuition Test</h2>',
                    '<div class="alert alert-info">',

                        '<h3><i class="fa fa-info-circle"></i> Please Read the Following Instructions</h3>',

                        '<ol>',
                            '<li>For each string, guess which "Rule Set" was used to generate that string by clicking one of the "Rule Set" buttons.</li>',
                            '<li>Spend LESS than 5 seconds per string. Just look, get a quick feeling, and guess.</li>',
                            '<li>Relax and do your best to develop intuition about the right ways to classify the strings.</li>',
                            '<li>The test is adaptive, so just keep guessing until it stops.</li>',
                            '<li>Good Luck!</li>',
                        '</ol>',

                        '<div>',
                            '<button class="btn btn-default btn-lg btn-full-width" ng-click="startTest()">Begin Test</button>',
                        '</div>',
                    '</div>',

                '</div>',

                '<div class="anim-fade-in" ng-if="!showingInstructions && !testComplete">',

                    '<div class="ml-schemes-test-question anim-fade-in" ng-click="nextPlease()">',
                        '<div class="well">',
                            '<div class="ml-schemes-test-question-string">&nbsp;{{currentQuestion.questionString}}&nbsp;</div>',
                            '<div class="ml-schemes-test-question-transition" ng-if="questionTransitionOn" ng-class="{\'transition-success\': isCorrect, \'transition-danger\': !isCorrect}"></div>',
                        '</div>',
                    '</div>',

                    '<div class="ml-schemes-test-answers anim-fade-in">',
                        '<button class="btn btn-lg" ng-class="{\'btn-success\': (schemeOptionSelected.name === schemeOption.name && isCorrect), \'btn-danger\': (schemeOptionSelected.name === schemeOption.name && !isCorrect), \'btn-default\': schemeOptionSelected.name !== schemeOption.name }" ng-repeat="schemeOption in schemeOptions" ng-click="chooseScheme(schemeOption)">',
                            '{{schemeOption.name}}',
                            '<i class="fa fa-check-circle" ng-if="schemeOptionSelected && (currentQuestion.correctAnswer === schemeOption.name)"></i>',
                        '</button>',
                    '</div>',

                '</div>',

                '<div class="ml-schemes-test-report anim-fade-in" ng-if="!showingInstructions && testComplete">',

                    '<h3>Test Is Complete! Your results have been recorded and you can now close this tab. Thank You!</h3>',

                    '<div class="well ml-report-table">',
                        '<div class="row">',
                            '<div class="col-md-12 text-left">',
                                '<span class="ml-report-label">PASSED:</span> {{passed}}',
                            '</div>',
                        '</div>',

                        '<div class="row">',
                            '<div class="col-md-12 text-left">',
                                '<span class="ml-report-label">QUESTIONS:</span> {{answers.length}}',
                            '</div>',
                        '</div>',

                        '<div class="row">',
                            '<div class="col-md-12 text-left">',
                                '<span class="ml-report-label">MAX INTERVAL SUCCESS PERCENT:</span> {{maxIntervalCorrectPercent}}%',
                            '</div>',
                        '</div>',
                    '</div>',

                    '<ml-schemes-test-report-graph answers="answers" schemes-count="schemesCount" max-tries="maxTries" interval-length="intervalLength" percent-threshold="percentThreshold"></ml-schemes-test-report-graph>',

                '</div>'

            ].join('')
        };
    });

})();