angular.module("RDash")
    .controller("DashboardController", ["$rootScope", "$scope", "$uibModal", "localStorageService", "employeeSrv", "projectSrv", "utilitySrv", "Roles", DashboardController]);

function DashboardController($rootScope, $scope, $uibModal, localStorageService, employeeSrv, projectSrv, utilitySrv, Roles) {

    var fetchAllocation = function (employeeIndex) {
        projectSrv.fetchAllocation($scope.employees[employeeIndex].email['S'], function (error, data) {
            if (!error) {
                var projectsResourceData = data;
                $scope.employees[employeeIndex].allocations = [700, 700, 700, 700, 700, 700, 700, 700, 700];
                if (projectsResourceData.length !== 0) {
                    angular.forEach(projectsResourceData, function (eachProjectResource) {
                        angular.forEach(eachProjectResource.resources.M[$scope.employees[employeeIndex].email['S']].M.roles.L,
                            function (employeeResource) {
                                fetchAllocationByWeek(employeeResource.M, employeeIndex);
                            }
                        );
                    });
                } else {
                    if (employeeIndex === $scope.employees.length - 1) {
                        if (!$scope.$$phase) {
                            $scope.$digest();
                        }
                        $rootScope.$broadcast('spinner', 'hide');
                    }
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
        }
        //console.log(employeeIndex);
        if (employeeIndex === $scope.employees.length-1) {
            $rootScope.$broadcast('spinner', 'hide');
            if (!$scope.$$phase) {
                $scope.$digest();
            }
        }
    };

    var nonResourceEmployee = function (roleId) {
        if (roleId !== '1' &&
            roleId !== '14' &&
            roleId !== '15' &&
            roleId !== '16' &&
            roleId !== '17' &&
            roleId !== '18') {
            return true;
        }
        return false;
    };

    var fetchEmployees = function () {
        var employees = localStorageService.get("employees");
        if (employees.length === 0) {
            $rootScope.$broadcast('spinner', 'hide');
            return;
        }
        angular.element('.fc-bg table tbody').html('');
        $scope.employees = [];
        var count = 0; //index
        angular.forEach(employees, function (employee) {
            employeeSrv.fetchEmployeeRoles(employee.email['S'], function (error, data) {
                if (!error && data.Items.length > 0 && nonResourceEmployee(data.Items[0].roles['NS'][0])) {
                    employee.roles = data.Items[0].roles;
                    $scope.employees.push(employee);
                    fetchAllocation(count);
                    count++;
                }
            });
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
            for (var i = 1; i <= 9; i++) {
                weeks.push(getWeekFromDates(first, last));
                first = new Date(last.setDate(last.getDate() + 1));
                last = new Date(last.setDate(last.getDate() + 6));
            }
            $scope.weeks = weeks;
        } else {
            for (var i = 1; i <= 9; i++) {
                weeks.push(getWeekFromDates(first, last));
                first = new Date(first.setDate(first.getDate() - 7));
                last = new Date(last.setDate(last.getDate() - 7));
            }
            $scope.weeks = weeks.reverse();
        }
        fetchEmployees();
    };

    $scope.showPrevDates = function () {
        $rootScope.$broadcast('spinner', 'show');
        var currDate = $scope.weeks[0][0];

        var first = new Date(currDate.setDate(currDate.getDate() - 7));
        var last = new Date(currDate.setDate(currDate.getDate() + 6));

        fetchWeeks(first, last, true);
    };

    $scope.showNextDates = function () {
        $rootScope.$broadcast('spinner', 'show');
        var currDate = $scope.weeks[8][6];

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

    var fetchEmployeesFromService = function (first, last) {
        employeeSrv.fetchEmployees(function (error, data) {
            if (!error) {
                localStorageService.set("employees", data.Items);
                fetchWeeks(first, last, false);
            }
        });
    };

    (function () {
        $scope.dashboardSearch = '';
        $scope.predicate1 = ['-allocations', 'firstName["S"]'];
        $scope.predicate2 = "";
        $scope.reverse = false;
        $scope.eventSources = [];
        $scope.employees = [];
        $scope.weeks = [];
        $scope.selectedRole = 'All';

        $scope.roles = Roles;

        var currDate = new Date();
        currDate.setHours(0, 0, 0, 0);

        var first = new Date(currDate.setDate(currDate.getDate() - (currDate.getDay() - 1)));
        var last = new Date(currDate.setDate(currDate.getDate() + 6));

        $rootScope.$broadcast('spinner', 'show');
        if (utilitySrv.isEmpty(localStorageService.get("employees")) || localStorageService.get("employees").length === 0) {
            fetchEmployeesFromService(first, last);
        } else {
            fetchWeeks(first, last, false);
        }

        $scope.$on("refresh", function (event, message) {
            if (message === 'dashboard') {
                $rootScope.$broadcast('spinner', 'show');
                fetchEmployeesFromService(first, last);
            }
        });
    })();

    $scope.filterBy = function (role) {
        console.log(role);
        $scope.selectedRole = role;
        if (role === '') {
            $scope.selectedRole = 'All';
            $scope.filterWithRole = {
                roles: {
                    NS: ''
                }
            };
        } else {
            for (var index in Roles) {
                if (Roles[index] === role) {
                    $scope.filterWithRole = {
                        roles: {
                            NS: index.toString()
                        }
                    };
                    if (!$scope.$$phase) {
                        $scope.$digest();
                    }
                    break;
                }
            }
        }
    };

    $scope.getColorByAllocation = function (allocation) {
        if (allocation < 0 || allocation === 0) {
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
        if (allocation < 0 || allocation === 0) {
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
                    console.log(employee);
                    return employee;
                }
            }
        });
    };
}