angular.module("RDash")
    .controller("EmployeeModalController", ["$scope", "$uibModalInstance", "projectSrv", "employee", "Roles", EmployeeModalController]);

function EmployeeModalController($scope, $uibModalInstance, projectSrv, employee, Roles) {

    var fetchProjectDetails = function (projectName, index) {
        projectSrv.fetchProjectDetails(projectName, function (error, data) {
            if (!error) {
                $scope.projects[index]['details'] = data.Items[0];
            }

            if (!$scope.$$phase) {
                $scope.$digest();
            }
        });
    };

    var fetchProjects = function () {
        projectSrv.fetchAllocation(employee.email['S'], function (error, data) {
            $scope.projects = data;
            angular.forEach($scope.projects, function (project, index) {
                fetchProjectDetails(project.projectName['S'], index);
            });
        });
    };

    (function () {
        $scope.employee = employee;
        fetchProjects();
    })();

    var roleClassNames = ['dce', 'program-lead', 'strategist', 'sol-dir', 'scrum', 'product', 'arch', 'lead-dev', 'dev', 'build-master', 'ui', 'ux', 'qa'];

    $scope.closeModal = function () {
        $uibModalInstance.dismiss();
    };

    $scope.fetchClassForRole = function (role) {
        return roleClassNames[parseInt(role)];
    };

    $scope.getRoleName = function (role) {
        return Roles[parseInt(role)];
    };

    $scope.getRole = function (roleId) {
        return Roles[parseInt(roleId)];
    };

    $scope.getAllocation = function (project) {
        return project.resources.M[employee.email['S']].M.allocation['N'];
    };

    $scope.getDate = function (project) {
        var endDate = '';
        projectSrv.fetchProjectDetails(project.projectName['S'], function (error, data) {
            endDate = data.Items[0].endDate['S'];
        });
        return endDate;
    };

    $scope.isFutureDate = function (date) {
        var startDate = new Date(date);
        if (startDate > new Date()) {
            return true;
        }
        return false;
    };

    $scope.dateFromString = function (dateString) {
        return new Date(dateString);
    };

    $scope.isOlderProject = function (date) {
        var endDate = new Date(date);
        if (endDate < new Date()) {
            return true;
        }
        return false;
    };

    $scope.canShowCuurentProjectTitle = function () {
        var canShowCurrentTitle = false;
        if ($scope.projects && $scope.projects.length > 0) {
            for (var index in $scope.projects) {
                if ($scope.projects[index].details) {
                    var projectEndDate = new Date($scope.projects[index].details.endDate['S']);
                    if (projectEndDate > new Date()) {
                        canShowCurrentTitle = true;
                    }
                }
            }
        }
        return canShowCurrentTitle;
    };

    $scope.canShowUpcomingProjectTitle = function () {
        var canShowUpcomingTitle = false;
        if ($scope.projects && $scope.projects.length > 0) {
            for (var index in $scope.projects) {
                if ($scope.projects[index].details) {
                    var projectStartDate = new Date($scope.projects[index].details.startDate['S']);
                    if (projectStartDate > new Date()) {
                        canShowUpcomingTitle = true;
                    }
                }
            }
        }
        return canShowUpcomingTitle;
    };
}