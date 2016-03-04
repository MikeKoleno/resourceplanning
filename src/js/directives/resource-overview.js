angular
    .module('RDash')
    .directive('rdResourceOverview', ['employeeSrv', rdResourceOverview]);


function rdResourceOverview() {
    var directive = {
        restrict: 'AE',
        templateUrl: 'templates/resource-overview.tpl.html',
        controller: function ($scope, employeeSrv) {
            (function () {
                $scope.employeeCount = $scope.projectsCount = 0;

                employeeSrv.fetch(function (error, data) {
                    if (!error) {
                        $scope.employeeCount = data.ScannedCount;
                    }
                });
            })();
        }
    };
    return directive;
};