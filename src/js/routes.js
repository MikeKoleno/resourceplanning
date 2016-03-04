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
            .state('dashboard', {
                url: '/',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/dashboard.tpl.html');
                },
                controller: 'DashboardController'
            })
            .state('projects', {
                url: '/projects',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/tables.tpl.html');
                }
            })
            .state('people', {
                url: '/people',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/tables.tpl.html');
                }
            });
    }
]);