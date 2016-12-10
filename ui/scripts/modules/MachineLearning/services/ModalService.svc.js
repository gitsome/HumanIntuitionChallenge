(function () {

    angular.module('MachineLearning').service('ModalService', [

        '$rootScope',
        '$uibModal',
        '$timeout',

        function ($rootScope, $uibModal, $timeout) {

            /*============ SERVICE DECLARATION ============*/

            var ModalService;


            /*============ PRIVATE METHODS AND VARIABLES ============*/

            var modalId = 0;
            var getNewModalId = function () {
                modalId++;
                return 'modal-id-' + modalId;
            };

            // for modals that have an id, we can track them to avoid opening another
            var modalReferenceMap = {};


            /*============ SERVICE DEFINITION ============*/

            ModalService = {

                open: function (modalOptions) {

                    $rootScope.$broadcast('dialog.onBeforeOpen');

                    modalOptions.scope = modalOptions.scope || $rootScope.$new();

                    var modalIdProvided = modalOptions.id;
                    var modalId;
                    if (modalIdProvided) {
                        modalId = modalOptions.id;
                    } else {
                        modalId = getNewModalId();
                    }

                    // if the id is already in our reference map then don't open and return current instance
                    // this means that modals opened repeatedly cannot chain on to the result promise
                    // these must be dumb modals that are notifications with no logic associated with cancel or close
                    if (modalReferenceMap[modalId]) {

                        // if the original has already rendered, add a shake effect
                        if (modalReferenceMap[modalId].element) {

                            modalReferenceMap[modalId].element.addClass('shake animated');
                            $timeout(function () {
                                modalReferenceMap[modalId].element.removeClass('shake animated');
                            }, 1000);
                        }

                        return false;
                    }

                    modalOptions.scope.modal = {
                        id: modalId,
                        labelId: modalId + '-label',
                        contentId: modalId + '-content',
                        instance: $uibModal.open(modalOptions)
                    };

                    modalOptions.scope.modal.instance.rendered.then(function () {

                        setTimeout(function () {

                            // todo, refactor modal so we don't have to do things like this to get a dom reference
                            modalOptions.scope.modal.instance.element = $('#' + modalOptions.scope.modal.contentId).parents('.modal-dialog');

                            // as of right now the modal directive is responsible for setting focus on the correct item
                            // the bootstrap library will look for autofocus also, doing it again here is redundant, but helps keep the contract in case we switch libraries
                            modalOptions.scope.modal.instance.element.find('[autofocus]').focus();

                            // for accessibility purposes we add some aria attributes
                            modalOptions.scope.modal.instance.element.attr('aria-hidden', 'false');

                        }, 1);
                    });

                    var onDialogClosed = function () {
                        // let everyone know we closed on successful resolution
                        $rootScope.$broadcast('dialog.closed');

                        // remove the reference
                        if (modalIdProvided) {
                            delete modalReferenceMap[modalIdProvided];
                        }

                        // if it was configured to be triggered from a source element, return focus there
                        if (modalOptions.sourceElement) {
                            $(modalOptions.sourceElement).focus();
                        }
                    };

                    // tack on a promise handler to help normalize open and close events
                    modalOptions.scope.modal.instance.result.then(onDialogClosed, onDialogClosed);

                    // if they provide an id to ensure the modal is unique
                    // then return false because unique modals cannot chain logic onto the complete or cancel promise
                    // this ensures any developers in the future get an error if they attempt this scenario
                    if (modalIdProvided) {

                        // first store the refence in our map
                        modalReferenceMap[modalIdProvided] = modalOptions.scope.modal.instance;

                        return false;
                    } else {
                        return modalOptions.scope.modal.instance;
                    }
                },

                openCustomModal: function (title, template, data, preventClose) {

                    var modalScope = $rootScope.$new();
                    modalScope.title = title;
                    modalScope.template = template;
                    modalScope.data = data || {};

                    return ModalService.open({
                        scope: modalScope,
                        template: '<ml-modal modal="modal" title="title" template="template" data="data"></ml-modal>',
                        backdrop: preventClose ? 'static' : true,
                        keyboard: preventClose ? false : true
                    });
                }
            };


            /*============ LISTENERS ============*/

            /*============ SERVICE PASSBACK ============*/

            return ModalService;

        }
    ]);

})();

