
var sessionConfigs = sessionConfigs || {};

(function(){

    /*========== ENTRY POINT ON DOCUMENT READY FROM THE MAIN TEMPLATE ============*/

    angular.module('MachineLearning', [
        'ngResource', 'ngCookies', 'ngSanitize', 'ngAnimate',   // angular modules
        'ui.bootstrap', // angular-ui bootstrap component modules
        'ui.router',                                            // angular-ui modules
        'ngStorage'                                             // local storage
    ]);


    /*======================== LOAD VALUES/CONSTANTS ========================*/

    angular.module('MachineLearning').value('ML_VIEW_MODE', sessionConfigs.mode);


    /*======================== LOAD CONFIGURATIONS ========================*/

    // ANIMATION CONFIGS
    angular.module('MachineLearning').config(function($provide, $animateProvider){

        // do not animate classes which match this pattern
        // so if you don't want animations... include noanim in the classname
        $animateProvider.classNameFilter(/^((?!noanim).)*$/i);
    });

    // INITIALIZE DATA FROM SERVER
    angular.module('MachineLearning').config(function($locationProvider, $stateProvider, $urlRouterProvider){

        $locationProvider.html5Mode(true);

        // if there are no url matches, then just go home
        $urlRouterProvider.otherwise("/");
    });


    /*======================== INITIALIZATION ========================*/

    // override the template/modal/window.html template to add some custom accessibility
    angular.module('MachineLearning').run(["$templateCache", function ($templateCache) {
        $templateCache.put("template/modal/window.html", [
            '<div modal-render="{{$isRendered}}" tabindex="-1"',
                'role="dialog" class="modal"',
                'aria-labelledby="{{$parent.modal.labelId}}"',
                'aria-describedby="{{$parent.modal.contentId}}"',
                'uib-modal-animation-class="fade"',
                'modal-in-class="in"',
                'ng-style="{\'z-index\': 1050 + index*10, display: \'block\'}" ng-click="close($event)">',
                '<div class="modal-dialog" ng-class="size ? \'modal-\' + size : \'\'">',
                    '<div class="modal-content" uib-modal-transclude></div>',
                '</div>',
            "</div>"
        ].join(' '));
    }]);

    // initialize the data
    angular.module('MachineLearning').run(function(SchemeService) {
        SchemeService.initialize(sessionConfigs.schemes);
    });

})();
