angular.module("RDash")
    .controller("EmployeeCreateModalController", ["$scope", "$filter", "$uibModalInstance", "employeeSrv", "projectSrv", "utilitySrv", "modalType", "Roles", "ngNotify", employeeCreateModalController]);

function employeeCreateModalController($scope, $filter, $uibModalInstance, employeeSrv, projectSrv, utilitySrv, modalType, Roles, ngNotify) {

    var getSkills = function () {
        employeeSrv.fetchSkills(function (error, data) {
            $scope.skills = [];
            data.Items.map(function (item) {
                $scope.skills.push(item.name['S']);
            });
        });
    };

    (function () {
        $scope.roles = Roles;
        $scope.employee = {
            skills: []
        };
        getSkills();
    })();

    $scope.fetchFilteredSkills = function (keyword) {
        var result = [];
        var skills = $filter("filter")($scope.skills, keyword);
        skills.map(function (item) {
            if ($scope.employee.skills.indexOf(item) === -1) {
                result.push(item);
            }
        });
        return result;
    };

    $scope.removeSkill = function (skill) {
        $scope.employee.skills.splice($scope.employee.skills.indexOf(skill), 1);
    };

    $scope.onSkillSelect = function ($item) {
        $scope.employee.skills.push($item);
        $scope.selected = "";
    };

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
                ngNotify.set("There seems an issue with the request. Please try again", 'error');
            } else {
                $uibModalInstance.close('employee created');
            }
        });
    };

    $scope.createEmployee = function () {
        var interests = [],
            skills = [],
            tempInterests = ($scope.employee.interests !== undefined && $scope.employee.interests !== "") ? $scope.employee.interests.split(',') : [],
            tempSkills = $scope.employee.skills;
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
                location: {
                    S: $scope.employee.location
                }
            },
            ConditionExpression: "#email <> :email",
            ExpressionAttributeNames: {
                "#email": "email"
            },
            ExpressionAttributeValues: {
                ":email": {
                    S: $scope.employee.email
                }
            }
        };

        if (interests.length !== 0) {
            params.Item['interests'] = {
                L: interests
            };
        }
        if (skills.length !== 0) {
            params.Item['skills'] = {
                L: skills
            };
        }
        if (!utilitySrv.isEmpty($scope.employee.travelPreference)) {
            params.Item['travelPreferences'] = {
                S: $scope.employee.travelPreference
            };
        }
        if (utilitySrv.isEmpty($scope.employee.firstName)
            || utilitySrv.isEmpty($scope.employee.lastName)
            || utilitySrv.isEmpty($scope.employee.email)
            || $scope.isRolesNotSelected()) {
            return;
        }
        employeeSrv.createEmployee(params, function (error, data) {
            if (error) {
                if (error.message === 'The conditional request failed') {
                    ngNotify.set("An employee with this email address already exists.", 'error');
                } else {
                    ngNotify.set("There seems an issue with the request. Please try again", 'error');
                }
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
    };
}