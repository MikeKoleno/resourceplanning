angular.module("RDash")
    .controller("ProjectsListModalController", ["$scope", "$filter", "employeeSrv", "projectSrv", "Roles", "$uibModal", projectsListModalController]);

function projectsListModalController($scope, $filter, employeeSrv, projectSrv, Roles, $uibModal) {
    var getEmployees = function () {
        employeeSrv.fetchEmployees(function (error, data) {
            $scope.employees = [];
            $scope.dces = [];
            data.Items.map(function (item) {
                employeeSrv.fetchEmployeeRoles(item.email['S'], function (error, data) {
                    if (!error && data.Items.length !== 1 || data.Items[0].roles['NS'][0] !== '1') {
                        $scope.employees.push(item);
                    } else {
                        $scope.dces.push(item);
                    }
                });
            });
        });
    };

    var fetchCurrentProjects = function () {
        projectSrv.fetchCurrentProjects(function (error, data) {
            data.Items.map(function (item) {
                $scope.projects = [];
                projectSrv.fetchResourcesForProject(item.name['S'], function (error, data) {
                    item.resourcesCount = 0;
                    data.Items.map(function (resourceItem) {
                        item.resources = resourceItem.resources;
                        for (var key in resourceItem.resources.M) {
                            for (var roleIndex in resourceItem.resources.M[key].M.roles.L) {
                                var endDate = new Date(resourceItem.resources.M[key].M.roles.L[roleIndex].M.endDate['S']);
                                if (endDate > new Date()) {
                                    item.resourcesCount++;
                                }
                            }
                        }
                    });
                    $scope.projects.push(item);
                    if (!$scope.$$phase) {
                        $scope.$digest();
                    }
                });
            });
        });
    };

    (function () {
        $scope.editingProject = '';
        getEmployees();
        fetchCurrentProjects();
        $scope.roles = Roles;

        $scope.selectedEmail = $scope.edit = [];
    })();

    $scope.convertDateFromString = function (dateString) {
        return new Date(dateString);
    };

    $scope.getEmployeeByEmail = function (employeeEmail) {
        var employee = $filter("filter")($scope.employees, {email: {S: employeeEmail}})[0];
        return employee.firstName['S'] + " " + employee.lastName["S"];
    };

    $scope.getRole = function (roleId) {
        return Roles[parseInt(roleId)];
    };

    $scope.updateProjectSelection = function (project) {
        $scope.editingProject = project.name['S'];
        var editModal = $uibModal.open({
            animation: true,
            templateUrl: 'templates/project-edit-modal.tpl.html',
            controller: "ProjectEditController",
            size: 'lg',
            resolve: {
                project: function () {
                    return project;
                },
                employees: function () {
                    return $scope.employees;
                },
                dces: function () {
                    return $scope.dces;
                }
            }
        });

        editModal.result.then(function (response) {
            if (response === 'project updated') {
                fetchCurrentProjects();
            }
        })
    };
}