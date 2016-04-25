angular
    .module('RDash.Services')
    .service('httpInterceptorConfig', ["$rootScope", "$q", "$injector", httpInterceptorConfig]);

function httpInterceptorConfig($rootScope, $q, $injector) {
    var $http;
    return {
        request: function (config) {
            //$rootScope.isPageLoading = true;
            return config;
        },
        requestError: function (rejection) {
            return $q.reject(rejection);
        },
        response: function (response) {
            $http = $http || $injector.get('$http');
            if ($http.pendingRequests.length < 1) {
                //$rootScope.isPageLoading = false;
            }
            return response;
        },
        responseError: function (rejection) {
            $http = $http || $injector.get('$http');
            if ($http.pendingRequests.length < 1) {
                //$rootScope.isPageLoading = false;
            }
            return $q.reject(rejection);
        }
    };
};