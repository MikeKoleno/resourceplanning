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
                employeeSrv.fetchCount().then(function (response) {
                    $scope.employeeCount = response.data.count;
                });

                projectSrv.fetchCount().then(function (response) {
                    $scope.projectsCount = response.data.count;
                })
            })();
        }
    };
    return directive;
};