(function () {

    angular.module('MachineLearning').directive('mlMain', function () {

        return {

            restrict: 'E',

            scope: {},

            controller: [

                '$scope',
                '$element',
                'LoadingService',
                'SchemeService',

                function ($scope, $element, LoadingService, SchemeService) {

                    /*============ MODEL ============*/

                    $scope.mode = 'main';

                    $scope.loading = false;

                    $scope.currentScheme = false;

                    $scope.loadingService = LoadingService;


                    /*============ MODEL DEPENDENT METHODS ============*/

                    /*============ BEHAVIOR ============*/


                    /*============ LISTENERS ============*/

                    $scope.$on('ml-schemes.editScheme', function (e, scheme) {
                        $scope.currentScheme = scheme;
                        $scope.mode = 'edit';
                    });

                    $scope.$on('ml-edit-scheme.done', function () {
                        $scope.mode = 'main';
                        $scope.loadingService.setIsLoading(true);
                        SchemeService.updateOrCreateScheme($scope.currentScheme).finally(function () {
                            $scope.loadingService.setIsLoading(false);
                        });
                        $scope.currentScheme = false;
                    });


                    /*============ INITIALIZATION ============*/
                }
            ],

            template: [

                '<div class="container">',
                    '<div class="row">',
                        '<div class="col-xs-12">',

                            '<h1>Humans VS Machines!</h1>',

                            '<ml-schemes class="anim-fade-in" ng-if="mode === \'main\'"></ml-schemes>',
                            '<ml-edit-scheme class="anim-fade-in" scheme="currentScheme" ng-if="mode === \'edit\'"></ml-schemes>',

                        '</div>',
                    '</div>',
                '</div>',

                '<div class="progress-loader" ng-if="loadingService.isLoading">',
                    '<span class="progress-loader-spinner">',
                        '<i class="fa fa-spinner fa-spin"></i>',
                    '</span>',
                '</div>'

            ].join('')
        };
    });

})();