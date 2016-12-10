(function () {

    angular.module('MachineLearning').directive('mlSchemeItem', function () {

        return {

            restrict: 'E',

            scope: {
                scheme: '='
            },

            controller: [

                '$scope',
                '$element',
                'ML_VIEW_MODE',

                function ($scope, $element, ML_VIEW_MODE) {

                    /*============ MODEL ============*/

                    $scope.allowEdit = ML_VIEW_MODE === 'edit';


                    /*============ MODEL DEPENDENT METHODS ============*/


                    /*============ BEHAVIOR ============*/

                    $scope.edit = function () {
                        $scope.$emit('ml-scheme-item.edit', $scope.scheme);
                    };

                    $scope.delete = function () {
                        $scope.$emit('ml-scheme-item.delete', $scope.scheme);
                    };


                    /*============ LISTENERS ============*/

                    /*============ INITIALIZATION ============*/

                }
            ],

            template: [

                '<div class="container-fluid">',

                    '<div class="row">',
                        '<div class="col-md-8">',
                            '<span class="ml-scheme-item-title emphasize">{{scheme.name}}</span>',
                        '</div>',
                        '<div class="col-md-4 text-right ml-scheme-item-controls" ng-if="allowEdit">',
                            '<button class="btn btn-default" ng-click="edit()"><i class="fa fa-pencil"></i> Edit</button>',
                            '<button class="btn btn-default" ng-click="delete()"><i class="fa fa-times-circle"></i> Delete</button>',
                        '</div>',
                    '</div>',

                '</div>'

            ].join('')
        };
    });

})();