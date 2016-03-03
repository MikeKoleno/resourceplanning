angular
    .module('RDash')
    .directive('rdResourceOverview', ['localStorageService', rdResourceOverview]);


function rdResourceOverview(localStorageService) {
    var directive = {
        restrict: 'AE',
        templateUrl: 'templates/resource-overview.tpl.html',
        controller: function ($scope, localStorageService) {
            (function () {
                $scope.employeeCount = $scope.projectsCount = 0;

                if (localStorageService.get('employees') !== undefined) {
                    $scope.employeeCount = localStorageService.get('employees').ScannedCount;
                }
            })();
        }
    };
    return directive;
};