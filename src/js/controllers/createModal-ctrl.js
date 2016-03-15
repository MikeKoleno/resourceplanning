angular.module("RDash")
    .controller("CreateModalController", ["$scope", "$filter", "$uibModalInstance", "employeeSrv", "projectSrv", "utilitySrv", "modalType", "Roles", "ngNotify", createModalController]);

function createModalController($scope, $filter, $uibModalInstance, employeeSrv, projectSrv, utilitySrv, modalType, Roles, ngNotify) {
    var getSkills = function () {
        employeeSrv.fetchSkills(function (error, data) {
            $scope.skills = [];
            data.Items.map(function (item) {
                $scope.skills.push(item.name['S']);
            });
        });
    };

    var getClients = function () {
        projectSrv.fetchClients(function (error, data) {
            $scope.clients = data.Items;
        });
    };

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

    var getRoles = function () {
        employeeSrv.fetchRoles(function (error, data) {
            $scope.roles = data.Items;
        });
    };

    // Disable weekend selection
    var disabled = function (data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    };

    (function () {
        $scope.modalType = modalType;
        $scope.roles = Roles;
        $scope.employee = {
            skills: []
        };

        $scope.project = {};

        $scope.resources = [
            {
                employee: {
                    name: "",
                    email: ""
                },
                role: {
                    id: 0,
                    title: ''
                },
                allocation: '',
                notes: ''
            }
        ];

        if (modalType === 'Project') {
            getSkills();
            getClients();
            getEmployees();
            getRoles();

            $scope.dateOptions = {
                dateDisabled: disabled,
                formatYear: 'yy',
                minDate: new Date(),
                startingDay: 1
            };

            $scope.popup1 = {
                opened: false
            };

            $scope.popup2 = {
                opened: false
            };

            $scope.project.startDate = new Date();
            $scope.project.endDate = new Date();

            $scope.calendarFormat = "MM/dd/yyyy";
        }
    })();

    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.addNewResource = function () {
        $scope.resources.push({
            employee: {
                name: "",
                email: ""
            },
            role: {
                id: 0,
                title: ''
            },
            allocation: '',
            notes: ''
        });
    };

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

    var fetchProjectParams = function () {
        var startDate = new Date($scope.project.startDate);
        var endDate = new Date($scope.project.endDate);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);
        var params = {
            TableName: "projects",
            Item: {
                name: {
                    S: $scope.project.name
                },
                clientName: {
                    S: $scope.project.client
                },
                startDate: {
                    S: startDate.toISOString()
                },
                endDate: {
                    S: endDate.toISOString()
                },
                platForm: {
                    L: [
                        {
                            S: $scope.project.platform
                        }
                    ]
                }
            },
            ConditionExpression: "#name <> :name",
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": {
                    S: $scope.project.name
                }
            }
        };

        if (!utilitySrv.isEmpty($scope.project.notes)) {
            params.Item.notes = {
                S: $scope.project.notes
            }
        }

        return params;
    };

    var addResourcesToProject = function (projectName) {
        var resources = {M: {}};

        angular.forEach($scope.resources, function(resource) {
            if (resources.M[resource.employee.email] === undefined) {
                resources.M[resource.employee.email] = {
                    M: {
                        allocation: {
                            N: resource.allocation
                        },
                        roles: {
                            NS: [resource.role.id]
                        }
                    }
                };
                if (!resources.M[resource.employee.email].notes && resource.notes !== "") {
                    resources.M[resource.employee.email]["notes"] = {
                        S: resource.notes
                    }
                }
            } else {
                resources.M[resource.employee.email].roles.NS.push(resource.role.id);
                if (resource.notes !== "") {
                    if (!resources.M[resource.employee.email].notes) {
                        resources.M[resource.employee.email]["notes"] = {
                            S: resource.notes
                        }
                    } else {
                        resources.M[resource.employee.email][notes].S += resource.notes;
                    }
                }
            }
        });

        var params = {
            TableName: "projectResource",
            Item: {
                projectName: {
                    S: projectName
                },
                resources: resources
            }
        };

        projectSrv.addResources(params, function (error, data) {
            if (error) {
                ngNotify.set("There seems an issue with the request. Please try again", 'error');
            } else {
                $uibModalInstance.close('project created');
            }
        });
    };

    var projectCreate = function () {
        var projectParams = fetchProjectParams();
        projectSrv.createProject(projectParams, function (error, data) {
            if (error && error.message === 'The conditional request failed') {
                ngNotify.set("The project with this name has already been created.", 'error');
            } else if (error) {
                ngNotify.set("There seems an issue with the request. Please try again", 'error');
            } else {
                addResourcesToProject($scope.project.name);
            }
        });
    };

    $scope.createProject = function () {
        if (!$scope.showClientDropdown) {
            var clientParam = {
                TableName: 'client',
                Item: {
                    name: {
                        S: $scope.project.client
                    },
                    dce: {
                        S: $scope.project.dce.email['S']
                    }
                },
                ConditionExpression: "#name <> :name",
                ExpressionAttributeNames: {
                    "#name": "name"
                },
                ExpressionAttributeValues: {
                    ":name": {
                        S: $scope.project.client
                    }
                }
            };
            projectSrv.createClient(clientParam, function (error, data) {
                if (error && error.message === 'The conditional request failed') {
                    ngNotify.set("The client with this name has already been created.", 'error');
                } else if (error) {
                    ngNotify.set("There seems an issue with the request. Please try again", 'error');
                } else {
                    projectCreate();
                }
            });
        }else {
            projectCreate();
        }
    };

    $scope.isResourcesFilled = function (index) {
        var isFilled = true;
        if (utilitySrv.isEmpty($scope.resources[index].employee.email)
            || parseInt($scope.resources[index].role.id) === 0
            || utilitySrv.isEmpty($scope.resources[index].allocation)) {
            isFilled = false;
        }
        return isFilled;
    };

    $scope.removeResource = function (index) {
        if (index === 0) {
            $scope.resources[index] = {
                employee: {
                    name: "",
                    email: ""
                },
                role: {
                    id: 0,
                    title: ''
                },
                allocation: '',
                notes: ''
            };
        } else {
            $scope.resources.splice(index, 1);
        }
    };
}