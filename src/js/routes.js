'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

        // For unmatched routes
        $urlRouterProvider.otherwise('/');

        // Application routes
        $stateProvider
            .state('index', {
                url: '/',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/dashboard.tpl.html');
                }
            })
            .state('tables', {
                url: '/tables',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/tables.tpl.html');
                }
            });
    }
]);