angular.module("RDash")
    .controller("DashboardController", ["$scope", "$uibModal", "employeeSrv", "projectSrv", "utilitySrv", "Roles", DashboardController]);

function DashboardController($scope, $uibModal, employeeSrv, projectSrv, utilitySrv, Roles) {

    var fetchAllocation = function ($index) {
        projectSrv.fetchAllocation($scope.employees[$index].email['S'], function (error, data) {
            if (!error) {
                var projectsResourceData = data;
                $scope.employees[$index].allocations = [700, 700, 700, 700, 700, 700, 700, 700, 700, 700];
                if (projectsResourceData.length !== 0) {
                    angular.forEach(projectsResourceData, function (eachProjectResource) {
                        angular.forEach(eachProjectResource.resources.M[$scope.employees[$index].email['S']].M.roles.L,
                            function (employeeResource) {
                                fetchAllocationByWeek(employeeResource.M, $index);
                            }
                        );
                    });
                }
            }
        });
    };

    var fetchAllocationByWeek = function (employeeResource, employeeIndex) {
        for (var i = 0; i < $scope.weeks.length; i++) {
            var endDate = new Date(employeeResource.endDate['S']);
            endDate.setHours(0, 0, 0, 0);

            var startDate = new Date(employeeResource.startDate['S']);
            startDate.setHours(0, 0, 0, 0);

            var allocationIndex = i,
                allocationsInWeek = $scope.employees[employeeIndex].allocations[allocationIndex],
                day = $scope.weeks[i][0],
                weekIndex = 0;
            while(day <= $scope.weeks[i][6]) {
                if (startDate <= day && endDate >= day) {
                    allocationsInWeek -= parseInt(employeeResource.allocation.N);
                } else {
                    allocationsInWeek -= 0;
                }
                weekIndex++;
                day = $scope.weeks[i][weekIndex];
            }

            $scope.employees[employeeIndex].allocations[allocationIndex] = angular.copy(allocationsInWeek);

            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }
    };

    var fetchEmployees = function () {
        employeeSrv.fetchEmployees(function (error, data) {
            if (!error) {
                var employees = data.Items;
                angular.element('.fc-bg table tbody').html('');
                angular.forEach(employees, function (employee) {
                    employeeSrv.fetchEmployeeRoles(employee.email['S'], function (error, data) {
                        if (!error && data.Items[0].roles['NS'][0] !== '1') {
                            var employeeIndex = -1;
                            angular.forEach($scope.employees, function(emp, index) {
                                if (emp.email['S'] === employee.email['S']) {
                                    employeeIndex = index;
                                }
                            });
                            employee.roles = data.Items[0].roles;
                            if (employeeIndex === -1) {
                                $scope.employees.push(employee);
                                fetchAllocation($scope.employees.length - 1);
                            } else {
                                fetchAllocation(employeeIndex);
                            }
                        }
                    });
                });
            }
        });
    };

    var getWeekFromDates = function (first, last) {
        var week = [];
        var current = angular.copy(first);
        while (current <= last) {
            var day = angular.copy(current);
            week.push(day);
            current = new Date(current.setDate(current.getDate() + 1));
        }
        return week;
    };

    var fetchWeeks = function (first, last, reverseWeek) {
        var weeks = [];
        if (!reverseWeek) {
            for (var i = 1; i <= 10; i++) {
                weeks.push(getWeekFromDates(first, last));
                first = new Date(last.setDate(last.getDate() + 1));
                last = new Date(last.setDate(last.getDate() + 6));
            }
            $scope.weeks = weeks;
        } else {
            for (var i = 1; i <= 10; i++) {
                weeks.push(getWeekFromDates(first, last));
                first = new Date(first.setDate(first.getDate() - 7));
                last = new Date(last.setDate(last.getDate() - 7));
            }
            $scope.weeks = weeks.reverse();
        }
        fetchEmployees();
    };

    $scope.showPrevDates = function () {
        var currDate = $scope.weeks[0][0];

        var first = new Date(currDate.setDate(currDate.getDate() - 7));
        var last = new Date(currDate.setDate(currDate.getDate() + 6));

        fetchWeeks(first, last, true);
    };

    $scope.showNextDates = function () {
        var currDate = $scope.weeks[9][6];

        var first = new Date(currDate.setDate(currDate.getDate() + 1));
        var last = new Date(currDate.setDate(currDate.getDate() + 6));

        fetchWeeks(first, last, false);
    };

    var roleClassNames = [
        'dce',
        'program-lead',
        'strategist',
        'sol-dir',
        'scrum',
        'product',
        'arch',
        'lead-dev',
        'dev',
        'build-master',
        'ui',
        'ux',
        'qa'
    ];

    (function () {
        $scope.dashboardSearch = '';
        $scope.predicate1 = ['-allocations', 'firstName["S"]'];
        $scope.predicate2 = "";
        $scope.reverse = false;
        $scope.eventSources = [];
        $scope.employees = [];
        $scope.weeks = [];

        var currDate = new Date();
        currDate.setHours(0, 0, 0, 0);

        var first = new Date(currDate.setDate(currDate.getDate() - (currDate.getDay() - 1)));
        var last = new Date(currDate.setDate(currDate.getDate() + 6));

        fetchWeeks(first, last, false);

        $scope.$on("refresh", function (event, message) {
            if (message === 'dashboard') {
                fetchWeeks(first, last, false);
            }
        });
    })();

    $scope.getColorByAllocation = function (allocation) {
        if (allocation < 0) {
            return utilitySrv.greenToRedColors(9);
        }
        var index = 10 - Math.round(Math.floor(allocation) / 10);
        if (index > 10) {
            return 10;
        } else {
            return utilitySrv.greenToRedColors(index);
        }
    };

    $scope.getPositiveAllocation = function (allocation) {
        if (allocation < 0 ) {
            return 100;
        } else {
            return allocation;
        }
    };

    $scope.order = function (predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };

    $scope.fetchClassForRole = function (role) {
        return roleClassNames[parseInt(role)];
    };

    $scope.getRoleName = function (role) {
        return Roles[parseInt(role)];
    };

    $scope.openEmployeeDetails = function (employee) {
        var employeeCardModal = $uibModal.open({
            animation: true,
            templateUrl: 'templates/employee-card.tpl.html',
            controller: "EmployeeModalController",
            size: 'lg',
            resolve: {
                employee: function () {
                    return employee;
                }
            }
        });
    };
}