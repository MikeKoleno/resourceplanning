angular.module("RDash")
    .controller("ProjectCreateModalController", ["$rootScope", "$scope", "$filter", "localStorageService", "$uibModalInstance", "employeeSrv", "projectSrv", "utilitySrv", "Roles", "ngNotify", projectCreateModalController]);

function projectCreateModalController($rootScope, $scope, $filter, localStorageService, $uibModalInstance, employeeSrv, projectSrv, utilitySrv, Roles, ngNotify) {
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
        $scope.dces = [];
        $scope.employees = localStorageService.get("employees");
        $scope.employees.map(function (item) {
            employeeSrv.fetchEmployeeRoles(item.email['S'], function (error, data) {
                if (!error && data.Items[0].roles['NS'].indexOf('1') !== -1) {
                    $scope.dces.push(item);
                }
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

    var clearResources = function () {
        $scope.resourceEmployee = {
            name: "",
            email: ""
        };
        $scope.resourceRole = {
            id: 0,
            title: ""
        };
        $scope.resourceAllocation = "";
        $scope.resourceNotes = "";
        $scope.selectedEmployee = "";
        $scope.resourceStartDate = new Date($scope.project.startDate);
        $scope.resourceEndDate = new Date($scope.project.endDate);
        $scope.resourceDateOptions.minDate = new Date($scope.project.startDate);
        $scope.resourceDateOptions.maxDate = new Date($scope.project.endDate);
    };

    $scope.filteredEmployees = function (employees) {
        return employees.filter(function (item) {
            if (!$scope.selectedEmployee) {
                return true;
            } else {
                return (item.firstName['S'].indexOf($scope.selectedEmployee) !== -1) ||
                    (item.lastName['S'].indexOf($scope.selectedEmployee) !== -1);
            }
        });
    };

    $scope.onSelectedEmployee = function (employee) {
        $scope.selectedEmployee = employee.firstName['S'] + ' ' + employee.lastName['S'];
        $scope.resourceEmployee.name = $scope.selectedEmployee;
        $scope.resourceEmployee.email = employee.email['S'];
    };

    (function () {
        $scope.selectedEmployee = "";
        $scope.canShowResourceForm = false;
        $scope.project = {};
        $scope.resources = [];

        getSkills();
        getClients();
        getEmployees();
        getRoles();

        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.resourceDateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            minDate: new Date(),
            maxDate: new Date(),
            startingDay: 1
        };

        $scope.popup1 = {
            opened: false
        };
        $scope.popup2 = {
            opened: false
        };
        $scope.popup3 = {
            opened: false
        };
        $scope.popup4 = {
            opened: false
        };

        $scope.project.startDate = new Date();
        $scope.project.endDate = new Date();

        $scope.calendarFormat = "MM/dd/yyyy";

        clearResources();
    })();

    $scope.closeModal = function () {
        $uibModalInstance.dismiss();
    };

    $scope.open1 = function () {
        $scope.popup1.opened = true;
    };

    $scope.open2 = function () {
        $scope.popup2.opened = true;
    };

    $scope.open3 = function () {
        $scope.popup3.opened = true;
    };

    $scope.open4 = function () {
        $scope.popup4.opened = true;
    };

    $scope.convertDateFromString = function (dateString) {
        return new Date(dateString);
    };

    $scope.addNewResource = function () {
        $scope.resourceFormSubmitted = true;
        if (!$scope.isResourcesFilled()) {
            return;
        }
        $scope.resources.push({
            employee: {
                name: $scope.resourceEmployee.name,
                email: $scope.resourceEmployee.email
            },
            role: {
                id: $scope.resourceRole.id,
                title: $scope.resourceRole.title
            },
            startDate: $scope.resourceStartDate.toISOString(),
            endDate: $scope.resourceEndDate.toISOString(),
            allocation: $scope.resourceAllocation,
            notes: $scope.resourceNotes
        });
        clearResources();
        $scope.resourceForm.$setPristine();
        $scope.resourceFormSubmitted = false;
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

    $scope.addResourcesToProject = function (projectName) {
        var resources = {M: {}};

        angular.forEach($scope.resources, function (resource) {
            var startDate = new Date(resource.startDate);
            startDate.setHours(0, 0, 0, 0);
            var endDate = new Date(resource.endDate);
            endDate.setHours(0, 0, 0, 0);
            if (resources.M[resource.employee.email] === undefined) {
                resources.M[resource.employee.email] = {
                    M: {
                        roles: {
                            L: [
                                {
                                    M: {
                                        allocation: {
                                            N: resource.allocation
                                        }, roleId: {
                                            N: resource.role.id
                                        }, endDate: {
                                            S: endDate.toString()
                                        }, startDate: {
                                            S: startDate.toString()
                                        }, notes: {
                                            S: (resource.notes === "") ? utilitySrv.emptyString() : resource.notes
                                        }
                                    }
                                }
                            ]
                        }
                    }
                };
            } else {
                resources.M[resource.employee.email].M.roles.L.push({
                    M: {
                        allocation: {
                            N: resource.allocation
                        }, roleId: {
                            N: resource.role.id
                        }, endDate: {
                            S: endDate.toString()
                        }, startDate: {
                            S: startDate.toString()
                        }, notes: {
                            S: (resource.notes === "") ? utilitySrv.emptyString() : resource.notes
                        }
                    }
                });
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
                $rootScope.$broadcast("refresh", "projects");
                $scope.resourceStartDate = new Date($scope.project.startDate);
                $scope.resourceEndDate = new Date($scope.project.endDate);
                $scope.resourceDateOptions.minDate = new Date($scope.project.startDate);
                $scope.resourceDateOptions.maxDate = new Date($scope.project.endDate);
                $scope.canShowResourceForm = true;
                if (!$scope.$$Phase) {
                    $scope.$digest();
                }
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
        } else {
            projectCreate();
        }
    };

    $scope.isResourcesFilled = function () {
        var isFilled = true;
        if (utilitySrv.isEmpty($scope.resourceEmployee.email)
            || parseInt($scope.resourceRole.id) === 0
            || utilitySrv.isEmpty($scope.resourceAllocation)) {
            isFilled = false;
        }
        return isFilled;
    };

    $scope.removeResource = function (index) {
        $scope.resources.splice(index, 1);
    };

    $scope.editResource = function (resource, index) {
        $scope.isEditing = true;
        $scope.resourceEmployee.name = resource.employee.name;
        $scope.resourceEmployee.email = resource.employee.email;
        $scope.resourceRole.id = resource.role.id;
        $scope.resourceRole.title = resource.role.title;
        $scope.resourceAllocation = resource.allocation;
        $scope.resourceNotes = resource.notes;
        $scope.resourceStartDate = new Date(resource.startDate);
        $scope.resourceEndDate = new Date(resource.endDate);
        $scope.editingIndex = index;
    };

    $scope.updateResource = function () {
        $scope.resourceFormSubmitted = true;
        if (!$scope.isResourcesFilled()) {
            return;
        }
        $scope.resources[$scope.editingIndex] = {
            employee: {
                name: $scope.resourceEmployee.name,
                email: $scope.resourceEmployee.email
            },
            role: {
                id: $scope.resourceRole.id,
                title: $scope.resourceRole.title
            },
            startDate: $scope.resourceStartDate,
            endDate: $scope.resourceEndDate,
            allocation: $scope.resourceAllocation,
            notes: $scope.resourceNotes
        };
        $scope.isEditing = false;
        $scope.editingIndex = '';
        clearResources();
        $scope.resourceForm.$setPristine();
        $scope.resourceFormSubmitted = false;
    }
}