(function () {

    angular.module('MachineLearning').directive('mlNameNewScheme', function () {

        return {

            restrict: 'E',

            // you would typically want to pass in the modal instance so you can use it to self close etc..
            scope: {
                modal: '=',
            },

            controller: [

                '$scope',

                function ($scope) {

                    /*============ PRIVATE VARIABLES =============*/

                    /*============ MODEL =============*/

                    $scope.name = '';


                    /*============ BEHAVIOR ============*/

                    $scope.cancel = function () {
                        $scope.modal.instance.dismiss();
                    };

                    $scope.confirm = function () {
                        if ($.trim($scope.name)) {
                            $scope.modal.instance.close($scope.name);
                        }
                    };


                    /*============ INITIALIZATION ============*/

                }
            ],

            template: [

                '<label>Scheme Name</label>',
                '<input type="text" placeholder="Enter Scheme Name" class="form-control" ng-model="name"/>',
                '<div class="modal-footer modal-footer-custom">',
                    '<button tabindex="0" class="btn btn-default" ng-click="cancel()">',
                        '<span>Cancel</span> ',
                    '</button>',
                    '<button tabindex="0" class="btn btn-primary" ng-click="confirm()">',
                        '<span>Create Scheme</span> ',
                    '</button>',
                '</div>'

            ].join('')
        };

    });

})();