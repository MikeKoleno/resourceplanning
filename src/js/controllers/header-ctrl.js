angular.module("RDash")
    .controller("HeaderController", ["$rootScope", "$scope", "resourcePlanner", "localStorageService", "employeeRecordsSync", "$uibModal", "ngNotify", headerController]);

function headerController($rootScope, $scope, resourcePlanner, localStorageService, employeeRecordsSync, $uibModal, ngNotify) {

    var createModal;

    (function () {
        ngNotify.config({
            theme: 'pure',
            position: 'top',
            duration: 3000,
            type: 'success',
            sticky: false,
            button: true,
            html: false
        });
    })();

    var updateRecord = function (employee) {
        if (employee.email === undefined) {
            return;
        }
        var skills = [],
            interests = [];
        var tempSkills = (employee.specialization) ? employee.specialization.split(',') : [];
        for (var index in tempSkills) {
            if (tempSkills[index].trim() !== "") {
                skills.push({S: tempSkills[index].trim()});
            }
        }
        var tempInterests = (employee.personalInterests) ? employee.personalInterests.split(',') : [];
        for (var index in tempInterests) {
            if (tempInterests[index].trim() !== "") {
                interests.push({S: tempInterests[index].trim()});
            }
        }
        var params = {
            TableName: 'employee',
            Item: {
                email: {
                    S: employee.email
                },
                firstName: {
                    S: employee.firstName
                },
                lastName: {
                    S: employee.lastName
                },
                active: {
                    BOOL: true
                }
            }
        };

        if (employee.office !== null) {
            params.Item['location'] = {
                S: employee.office
            }
        }
        if (skills.length > 0) {
            params.Item['skills'] = {
                L: skills
            }
        }
        if (interests.length > 0) {
            params.Item['interests'] = {
                L: interests
            }
        }

        resourcePlanner.putItem(params, function (err, data) {
            if (err) {
                console.error(err);
            }
        });
    };

    var updateRoles = function (employee) {
        if (employee.email === undefined) {
            return;
        }
        var roles = employeeRecordsSync.setRoles(employee.role, employee.title);
        if (roles.length !== 0) {
            var rolesParam = {
                TableName: "employeeRoles",
                Item: {
                    email: {
                        S: employee.email
                    },
                    roles: {
                        NS: roles
                    }
                }
            };
            resourcePlanner.putItem(rolesParam, function (err, data) {
                if (err) {
                    console.log(err);
                }
            });
        }
    };

    $scope.employeeRecordsSync = function () {
        employeeRecordsSync.fetchEmployees().then(function (response) {
            response.data.map(function (employee) {
                employeeRecordsSync.fetchEmployee(employee.email).then(function (response) {
                    updateRecord(response.data);
                    updateRoles(response.data);
                });
            });
        });
    };

    $scope.openEmployeeCreateModal = function () {
        createModal = $uibModal.open({
            animation: true,
            templateUrl: 'templates/employee-create-modal.tpl.html',
            controller: "EmployeeCreateModalController",
            size: 'lg',
            resolve: {
                modalType: function () {
                    return 'Employee';
                }
            }
        });

        createModal.result.then(function (message) {
            if (message === 'employee created') {
                localStorageService.remove("employees");
                ngNotify.set('Employee created successfully');
                $rootScope.$broadcast("refresh", "dashboard");
            }
        });
    };
    
    $scope.openProjectCreateModal = function () {
        createModal = $uibModal.open({
            animation: true,
            templateUrl: 'templates/project-create-modal.tpl.html',
            controller: "ProjectCreateModalController",
            size: 'lg',
            resolve: {
                modalType: function () {
                    return 'Project'
                }
            }
        });

        createModal.result.then(function (message) {
            if (message === 'project created') {
                ngNotify.set('Project created successfully');
                $rootScope.$broadcast("refresh", "dashboard");
            }
        });
    };


}

