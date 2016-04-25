angular
    .module('RDash')
    .directive('rdResourceOverview', ['employeeSrv', 'projectSrv', rdResourceOverview]);


function rdResourceOverview() {
    var directive = {
        restrict: 'AE',
        templateUrl: 'templates/resource-overview.tpl.html',
        controller: function ($scope, employeeSrv, projectSrv) {
            (function () {
                $scope.employeeCount = $scope.projectsCount = 0;
                employeeSrv.fetchEmployees(function (error, data) {
                    if (!error) {
                        $scope.employeeCount = data.Count;
                    }
                });

                projectSrv.fetchCurrentProjects(function (error, data) {
                    if (!error) {
                        $scope.projectsCount = data.Count;
                        if (!$scope.$$phase) {
                            $scope.$digest();
                        }
                    }
                });
            })();
        }
    };
    return directive;
};