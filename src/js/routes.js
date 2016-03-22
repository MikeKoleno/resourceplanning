'use strict';

/**
 * Route configuration for the RDash module.
 */
angular.module('RDash').config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider) {
        //Http Interceptor Configuration Set
        $httpProvider.interceptors.push('httpInterceptorConfig');

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
                    return $templateCache.get('templates/projects-view.tpl.html');
                },
                controller: 'ProjectsListModalController'
            })
            .state('people', {
                url: '/people',
                templateProvider: function ($templateCache) {
                    return $templateCache.get('templates/tables.tpl.html');
                }
            });
    }
]);