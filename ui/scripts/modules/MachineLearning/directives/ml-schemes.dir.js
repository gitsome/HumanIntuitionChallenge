(function () {

    angular.module('MachineLearning').directive('mlSchemes', function () {

        return {

            restrict: 'E',

            scope: {
                scheme: '='
            },

            controller: [

                '$scope',
                '$element',
                '$timeout',
                'Moment',
                'ModalService',
                'SchemeService',
                'DataGeneratorService',
                'LoadingService',
                'ML_VIEW_MODE',

                function ($scope, $element, $timeout, Moment, ModalService, SchemeService, DataGeneratorService, LoadingService, ML_VIEW_MODE) {

                    /*============ MODEL ============*/

                    $scope.schemesMode = 'view';

                    $scope.schemes = [];

                    $scope.loading = false;

                    $scope.allowEdit = ML_VIEW_MODE === 'edit';
                    $scope.ML_VIEW_MODE = ML_VIEW_MODE;


                    /*============ MODEL DEPENDENT METHODS ============*/

                    var loadSchemes = function () {

                        LoadingService.setIsLoading(true);
                        SchemeService.get().then(function (schemes_in) {
                            $scope.schemes = schemes_in;
                        }).finally(function () {
                            LoadingService.setIsLoading(false);
                        });
                    };

                    var deleteScheme = function (schemeToDelete) {

                        LoadingService.setIsLoading(true);
                        SchemeService.deleteScheme(schemeToDelete).then(function () {
                            return loadSchemes();
                        });
                    };


                    /*============ BEHAVIOR ============*/

                    $scope.create = function () {

                        var modalInstance = ModalService.openCustomModal('Name Your New Scheme', '<ml-name-new-scheme modal="modal"></ml-name-new-scheme>');

                        modalInstance.result.then(function (schemeName) {

                            LoadingService.setIsLoading(true);

                            var newScheme = {
                                name: schemeName,
                                transforms: []
                            };

                            SchemeService.updateOrCreateScheme(newScheme).then(function (serverScheme) {

                                return SchemeService.get().then(function (schemes_in) {

                                    $scope.schemes = schemes_in;

                                    $timeout(function () {
                                        $scope.$emit('ml-schemes.editScheme', serverScheme);
                                        LoadingService.setIsLoading(false);
                                    }, 1000);
                                });

                            }, function () {
                                LoadingService.setIsLoading(false);
                            });
                        });
                    };

                    $scope.takeTest = function () {
                        $scope.schemesMode = 'test';
                    };

                    $scope.generateData = function () {

                        LoadingService.setIsLoading(true);

                        SchemeService.get().then(function (schemes_in) {

                            DataGeneratorService.generateData(schemes_in).then(function (data) {
                                return SchemeService.saveData(data);
                            }).finally(function () {
                                LoadingService.setIsLoading(false);
                            });
                        });
                    };


                    /*============ LISTENERS ============*/

                    $scope.$on('ml-scheme-item.delete', function (e, scheme) {
                        deleteScheme(scheme);
                    });

                    $scope.$on('ml-scheme-item.edit', function (e, scheme) {
                        $scope.$emit('ml-schemes.editScheme', scheme);
                    });

                    $scope.$on('ml-schemes-test.complete', function () {
                        $scope.schemesMode = 'view';
                    });



                    /*============ INITIALIZATION ============*/

                    loadSchemes();
                }
            ],

            template: [

                '<div class="row anim-fade-in" ng-if="schemesMode === \'view\'">',
                    '<div class="col-xs-12">',

                        '<div class="row view-title">',

                            '<div class="col-xs-7">',
                                '<h2>All Schemes (Rule Sets)</h2>',
                            '</div>',

                            '<div class="col-xs-5 text-right">',
                                '<button class="btn btn-primary" ng-if="allowEdit" ng-click="create()" ng-disabled="loading">',
                                    '<i class="fa fa-magic noanim" ng-if="!loading"></i>',
                                    '<i class="fa fa-spin fa-spinner noanim" ng-if="loading"></i>',
                                    ' Create New Scheme',
                                '</button>',
                            '</div>',

                        '</div>',

                        '<div class="alert alert-info" ng-if="!schemes || !schemes.length"><i class="fa fa-info-circle"></i> <strong>No Schemes Yet!</strong> Try refreshing or create a new scheme.</div>',

                        '<ml-scheme-item class="anim-el-slide-right" ng-repeat="scheme in schemes track by scheme.id" scheme="scheme" is-disabled="loading"></ml-scheme-item>',

                        '<div class="ml-schemes-test-container" ng-if="ML_VIEW_MODE === \'edit\'">',
                            '<div class="row">',
                                '<div class="col-md-6">',
                                    '<button class="btn btn-default btn-lg btn-full-width" ng-click="generateData()"><i class="fa fa-cog"></i> Generate Data</button>',
                                '</div>',
                                '<div class="col-md-6">',
                                    '<button class="btn btn-primary btn-lg btn-full-width" ng-click="takeTest()"><i class="fa fa-check-circle"></i> Take the Intuition Test!</button>',
                                '</div>',
                            '</div>',
                        '</div>',

                        '<div class="ml-schemes-test-container" ng-if="ML_VIEW_MODE === \'view\'">',
                            '<div class="row">',
                                '<div class="col-xs-12">',
                                    '<button class="btn btn-primary btn-lg btn-full-width" ng-click="takeTest()"><i class="fa fa-check-circle"></i> Take the Intuition Test!</button>',
                                '</div>',
                            '</div>',
                        '</div>',

                    '</div>',
                '</div>',

                '<ml-schemes-test class="anim-fade-in" ng-if="schemesMode === \'test\'"></ml-schemes-test>'

            ].join('')
        };
    });

})();