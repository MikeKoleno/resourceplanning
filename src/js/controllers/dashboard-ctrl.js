angular.module("RDash")
    .controller("DashboardController", ["$scope", "$compile", "employeeSrv", "projectSrv", "utilitySrv", DashboardController]);

function DashboardController($scope, $compile, employeeSrv, projectSrv, utilitySrv) {

    var fetchAllocation = function ($index) {
        angular.element('.fc-bg table tbody').append("<tr></tr>");
        projectSrv.fetchAllocation($scope.employees[$index].email['S'], function (error, data) {
            if (!error) {
                var projectsResourceData = data.Items;
                var allocation = 0;
                $scope.allocationInWeek = [0, 0, 0, 0, 0, 0, 0];
                if (projectsResourceData.length !== 0) {
                    angular.forEach(projectsResourceData, function (eachProjectResource) {
                        findAllocationByWeek(eachProjectResource, $index);
                    });
                } else {
                    populateCalendarWithAllocations($scope.allocationInWeek, $index);
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
                $scope.weekStartDate.setHours(0, 0, 0, 0);
                $scope.weekEndDate.setHours(0, 0, 0, 0);

                for (var date = $scope.weekStartDate,i = 0 ; date <= $scope.weekEndDate; date = new Date(date.setDate(date.getDate() + 1)), i++) {
                    if (endDate >= date) {
                        $scope.allocationInWeek[i] += parseInt(projectResource.allocation['N']);
                    }
                }

                populateCalendarWithAllocations($scope.allocationInWeek, employeeIndex);
            }
        });
    };

    var populateCalendarWithAllocations = function (allocations, employeeIndex) {
        $(angular.element('.fc-bg table tbody tr')[employeeIndex]).html('');

        for (var i = 0; i < 7; i++) {
            var allocation = 100 - allocations[i];
            var allocationMeter = "<div round-progress " +
                "max='100'" +
                "current='" + allocation + "'" +
                "radius='50'" +
                "color='" + utilitySrv.greenToRedColors((allocations[i] % 100) / 10) + "'" +
                "bgcolor='#ddd'" +
                "stroke='10'" +
                "clockwise='true'" +
                "duration='800'" +
                "animation='easeInOutQuart'" +
                "animation-delay='0'></div>";

            $(angular.element('.fc-bg table tbody tr')[employeeIndex])
                .append("<td><span class='allocation-value'>" + allocation + "</span>" + allocationMeter + "</td>");
        }

        $compile($(angular.element('.fc-bg table tbody tr')[employeeIndex]).contents())($scope);
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
                            if (!$scope.$$phase) {
                                $scope.$digest();
                            }
                        }
                    });
                });
            }
        });

    };

    (function () {
        $scope.dashboardSearch = '';
        $scope.predicate = "allocation['N']";
        $scope.reverse = false;
        $scope.eventSources = [];
        $scope.employees = [];

        $scope.weekStartDate = $scope.weekEndDate = new Date();

        $scope.uiConfig = {
            calendar:{
                editable: true,
                header:{
                    left: 'basicWeek',
                    center: 'title',
                    right: 'today prev,next'
                },
                viewRender: function(view, element) {
                    var one_day=1000*60*60*24;

                    if ((view.end._d - view.start._d)/one_day === 7) {
                        $scope.weekStartDate = view.start._d;
                        $scope.weekEndDate = view.end._d;
                        fetchEmployees(view.start._d, view.end._d);
                    }
                }
            }
        };

        setTimeout(function () {
            angular.element('.fc-basicWeek-button').click().hide();
        }, 0);

    })();

    $scope.order = function (predicate) {
        $scope.reverse = ($scope.predicate === predicate) ? !$scope.reverse : false;
        $scope.predicate = predicate;
    };
}