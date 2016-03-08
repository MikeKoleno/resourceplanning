angular.module("RDash")
    .controller("CreateModalController", ["$scope", "$uibModalInstance", "employeeSrv", "projectSrv", "utilitySrv", "modalType", "Roles", "ngNotify", createModalController]);

function createModalController($scope, $uibModalInstance, employeeSrv, projectSrv, utilitySrv, modalType, Roles) {
    (function () {
        $scope.modalType = modalType;
        $scope.roles = Roles;
    })();
    
    $scope.closeModal = function () {
        $uibModalInstance.dismiss();
    };

    var assignRoleToEmployee = function (email, roles) {
        var assignedRoles = [];
        for (var key in roles) {
            if (roles[key]) {
                var roleId = parseInt(key) + 1;
                assignedRoles.push(roleId.toString());
            }
        }
        var params = {
            TableName: 'employeeRoles',
            Item: {
                email: {
                    S: email
                },
                roles: {
                    NS: assignedRoles
                }
            }
        };
        employeeSrv.assignRolesToEmployee(params, function (error, data) {
            if (error) {
                ngNotify.set(error.message, 'error');
            } else {
                $uibModalInstance.close('employee created');
            }
        });
    };
    
    $scope.createEmployee = function () {
        var interests = [],
            skills = [],
            tempInterests = ($scope.employee.interests !== undefined && $scope.employee.interests !== "") ? $scope.employee.interests.split(',') : [],
            tempSkills = ($scope.employee.skills !== undefined && $scope.employee.skills !== "") ? $scope.employee.skills.split(',') : [];
        for (var i = 0; i < tempInterests.length; i++) {
            interests.push({
                S: tempInterests[i].trim()
            });
        }
        for (var i = 0; i < tempSkills.length; i++) {
            skills.push({
                S: tempSkills[i].trim()
            });
        }
        var params = {
            TableName: "employee",
            Item: {
                email: {
                    S: $scope.employee.email
                },
                firstName: {
                    S: $scope.employee.firstName
                },
                lastName: {
                    S: $scope.employee.lastName
                },
                interests: {
                    L: interests
                },
                location: {
                    S: $scope.employee.location
                },
                skills: {
                    L: skills
                },
                travelPreferences: {
                    S: $scope.employee.travelPreference
                }
            }
        };
        if (utilitySrv.isEmpty($scope.employee.firstName)
            || utilitySrv.isEmpty($scope.employee.lastName)
            || utilitySrv.isEmpty($scope.employee.email)
            || $scope.isRolesNotSelected()) {
            return;
        }
        employeeSrv.createEmployee(params, function (error, data) {
            if (error) {
                console.warn(error, error.message);
            } else {
                assignRoleToEmployee($scope.employee.email, $scope.employee.roles);
            }
        });
    };

    $scope.isRolesNotSelected = function () {
        if ($scope.employee.roles === undefined || $scope.employee.roles === null || $scope.employee.roles === {}) {
            return true;
        } else {
            var isEmpty = true;
            for (var key in $scope.employee.roles) {
                if ($scope.employee.roles[key]) {
                    isEmpty = false;
                }
            }
            return isEmpty;
        }
    }
}