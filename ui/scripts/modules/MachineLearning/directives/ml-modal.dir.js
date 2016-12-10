(function () {

    angular.module('MachineLearning').directive('mlModal', function () {

        return {

            restrict: 'E',

            // you would typically want to pass in the modal instance so you can use it to self close etc..
            scope: {
                modal: '=',
                title: '=',
                template: '=',
                data: '='
            },

            controller: [

                '$scope',
                '$element',
                '$compile',

                function ($scope, $element, $compile) {

                    /*============ PRIVATE VARIABLES =============*/

                    var childScope = $scope.$new();
                    $.extend(childScope, $scope.data, {modal: $scope.modal});


                    /*============ MODEL =============*/

                    /*============ BEHAVIOR ============*/

                    /*============ INITIALIZATION ============*/

                    var templateElement = $($scope.template);
                    $element.find('.modal-body').append(templateElement);

                    $compile(templateElement)(childScope);
                }
            ],

            template: [

                // NOTE: [autofocus] for modals
                '<div autofocus tabindex="-1" id="{{modal.labelId}}">',

                    '<div class="modal-header">',
                        '<h3 class="modal-title">',
                            ' <span>{{title}}</span>',
                        '</h3>',
                    '</div>',

                    '<div class="modal-content-wrapper">',
                        // NOTE: Here we add in the contentID
                        '<div class="modal-body" id="{{modal.contentId}}"></div>',
                    '</div>',

                '</div>'

            ].join('')
        };

    });

})();