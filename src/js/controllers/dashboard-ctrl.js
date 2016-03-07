angular.module("RDash")
    .controller("DashboardController", ["$scope", "$compile", "employeeSrv", "projectSrv", "utilitySrv", DashboardController]);

function DashboardController($scope, $compile, employeeSrv, projectSrv, utilitySrv) {

    var fetchAllocation = function ($index) {
        angular.element('.fc-bg table tbody').append("<tr></tr>");
        projectSrv.fetchAllocation($scope.employees[$index].email['S'], function (error, data) {
            if (!error) {
                var projectsResourceData = data.Items;
                $scope.employees[$index].allocations = [100, 100, 100, 100, 100, 100, 100, 100, 100, 100];
                if (projectsResourceData.length !== 0) {
                    angular.forEach(projectsResourceData, function (eachProjectResource) {
                        findAllocationByWeek(eachProjectResource, $index);
                    });
                }
            }
        });
    };

    var findAllocationByWeek = function (projectResource, employeeIndex) {
        projectSrv.fetchProjectDetails(projectResource.projectId['N'], function (error, data) {
            if (!error) {
                var projectDetails = data.Items[0];
                var endDate = new Date(projectDetails.endDate['S']);
                endDate.setHours(0, 0, 0, 0);

                var allocationsTemp = $scope.employees[employeeIndex].allocations;

                for (var i = 0; i < $scope.dates.length; i++) {
                    if (endDate >= $scope.dates[i]) {
                        allocationsTemp[i] -= parseInt(projectResource.allocation['N']);
                    } else {
                        allocationsTemp[i] -= 0;
                    }
                }

                if (!$scope.$$phase) {
                    $scope.$digest();
                }

                $scope.employees[employeeIndex].allocations = allocationsTemp;
            }
        });
    };

    var fetchEmployees = function () {
        employeeSrv.fetch(function (error, data) {
            if (!error) {
                var employees = data.Items;
                $scope.employees = [];
                angular.element('.fc-bg table tbody').html('');
                var i = 0;
                angular.forEach(employees, function (employee) {
                    employeeSrv.fetchEmployeeRoles(employee.email['S'], function (error, data) {
                        if (!error && data.Items.length !== 1 || data.Items[0].roleId['N'] !== '1') {
                            $scope.employees.push(employee);
                            fetchAllocation(i);
                            i++;
                        }
                    });
                });
            }
        });

    };


    var fetchWeekDays = function () {
        var curr = new Date();
        curr.setHours(0, 0, 0, 0);
        $scope.dates = [curr];

        for (var i = 1; i < 10; i++) {
            var nextDate = new Date();
            nextDate = new Date(nextDate.setDate(nextDate.getDate() + i));
            nextDate.setHours(0, 0, 0, 0);

            $scope.dates.push(nextDate);
        }

        fetchEmployees();
    };

    (function () {
        $scope.dashboardSearch = '';
        $scope.predicate = "allocations";
        $scope.reverse = false;
        $scope.eventSources = [];
        $scope.employees = [];

        fetchWeekDays();
    })();

    $scope.getColorByAllocation = function (allocation) {
        return utilitySrv.greenToRedColors(10 - (allocation / 10));
    };

    $scope.order = function (predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };

    $scope.showPrevDates = function () {
        var current = new Date();
        current.setHours(0, 0, 0, 0);
        if ($scope.dates[0].getTime() != current.getTime()) {
            var first = $scope.dates[0];
            $scope.dates = [];
            for (var i = 9; i >= 0; i--) {
                var prevDate = angular.copy(first);
                prevDate = new Date(prevDate.setDate(prevDate.getDate() - i));
                prevDate.setHours(0, 0, 0, 0);

                $scope.dates.push(prevDate);
            }
            fetchEmployees();
        }
    };

    $scope.showNextDates = function () {
        var last = $scope.dates[9]
        $scope.dates = [];
        for (var i = 0; i < 10; i++) {
            var nextDate = angular.copy(last);
            nextDate = new Date(nextDate.setDate(nextDate.getDate() + i));
            nextDate.setHours(0, 0, 0, 0);

            $scope.dates.push(nextDate);
        }
        fetchEmployees();
    };
}