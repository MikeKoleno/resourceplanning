angular
    .module('RDash')
    .directive('rdResourceOverview', [ 'employeeSrv', 'projectSrv', rdResourceOverview]);


function rdResourceOverview() {
    var directive = {
        restrict: 'AE',
        templateUrl: 'templates/resource-overview.tpl.html',
        controller: function ($scope, employeeSrv, projectSrv) {
            (function () {
                $scope.employeeCount = $scope.projectsCount = 0;
            })();
        }
    };
    return directive;
};