angular.module("RDash")
    .controller("ProjectEditController", ["$scope", "$filter", "project", "employees", "dces", "$uibModalInstance", "employeeSrv", "projectSrv", "utilitySrv", "Roles", "ngNotify", projectEditController]);

function projectEditController($scope, $filter, project, employees, dces, $uibModalInstance, employeeSrv, projectSrv, utilitySrv, Roles, ngNotify) {

    var getClients = function () {
        projectSrv.fetchClients(function (error, data) {
            $scope.clients = data.Items;
        });
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
    
    $scope.onSelectedNewEmployee = function (employee) {
        $scope.selectedNewEmployee = {
            name: employee.firstName['S'] + ' ' + employee.lastName['S'],
            email: employee.email['S']
        };
    };

    $scope.convertDateFromString = function (dateString) {
        return new Date(dateString);
    };

    $scope.updatePredicate = function (value) {
        $scope.predicate = value;
    };

    $scope.onSelectDCE = function (dce) {
        $scope.selectedDCE = dce;
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
        $scope.resourceStartDate = new Date($scope.editProject.startDate['S']);
        $scope.resourceEndDate = new Date($scope.editProject.endDate['S']);
        $scope.resourceAllocation = "";
        $scope.resourceNotes = "";
        $scope.editingIndex = "";
        $scope.isEditing = false;
        $scope.selectedEmployee = "";
        $scope.isUpdating = false;
    };

    $scope.isCurrentProject = function (startDate) {
        var projStartDate = new Date(startDate);
        if (projStartDate > new Date()) {
            $scope.predicate = 'upcoming';
            $scope.active = 1;
        } else {
            $scope.predicate = 'current';
            $scope.active = 0;
        }
    };

    $scope.isFutureProject = function (startDate) {
        var projStartDate = new Date(startDate);
        if (projStartDate > new Date()) {
            return true;
        } else {
            return false;
        }
    };

    (function () {
        $scope.selectedEmployee = "";
        $scope.editProject = angular.copy(project);
        $scope.employees = angular.copy(employees);
        $scope.dces = angular.copy(dces);
        $scope.roles = Roles;
        $scope.projectStartDate = $scope.convertDateFromString($scope.editProject.startDate["S"]);
        $scope.projectEndDate = $scope.convertDateFromString($scope.editProject.endDate["S"]);
        getClients();
        clearResources();

        $scope.dateOptions = {
            dateDisabled: disabled,
            formatYear: 'yy',
            maxDate: new Date($scope.editProject.endDate['S']),
            minDate: new Date($scope.editProject.startDate['S']),
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
        $scope.calendarFormat = "MM/dd/yyyy";
    })();

    $scope.closeModal = function () {
        $uibModalInstance.dismiss();
    };

    $scope.getEmployeeByEmail = function (employeeEmail) {
        if (employeeEmail == "") {
            return "";
        }
        var employee = $filter("filter")($scope.employees, {email: {S: employeeEmail}})[0];
        return employee.firstName['S'] + " " + employee.lastName["S"];
    };

    $scope.getRole = function (roleId) {
        return Roles[parseInt(roleId)];
    };

    // Disable weekend selection
    var disabled = function (data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    };

    $scope.startDate = function() {
        $scope.popup1.opened = true;
    };

    $scope.endDate = function() {
        $scope.popup2.opened = true;
    };

    $scope.open3 = function() {
        $scope.popup3.opened = true;
    };

    $scope.open4 = function() {
        $scope.popup4.opened = true;
    };

    $scope.addEmployeeToResource = function (email, $index) {
        if (email !== undefined) {
            var resource = $scope.editProject.resources.M['N/A'].M.roles.L[$index].M;

            $scope.editProject.resources.M['N/A'].M.roles.L.splice($index, 1);

            if ($scope.editProject.resources.M['N/A'].M.roles.L.length === 0) {
                delete $scope.editProject.resources.M['N/A'];
            }
            if ($scope.editProject.resources.M[email] === undefined) {
                $scope.editProject.resources.M[email] = {
                    M: {
                        roles: {
                            L: [
                                {
                                    M: resource
                                }
                            ]
                        }
                    }
                }
            } else {
                $scope.editProject.resources.M[email].M.roles.L.push({M: resource});
            }
            $scope.selectedNewEmployee = {
                name: '',
                email: ''
            };
        }
    };
    
    $scope.editResource = function (email, $index) {
        var resource = $scope.editProject.resources.M[email].M.roles.L[$index].M;
        $scope.resourceEmployee = {
            name: $scope.getEmployeeByEmail(email),
            email: email
        };
        $scope.resourceRole = {
            id: resource.roleId['N'],
            title: $scope.getRole(resource.roleId['N'])
        };
        $scope.resourceStartDate = new Date(resource.startDate['S']);
        $scope.resourceEndDate = new Date(resource.endDate['S']);
        $scope.resourceAllocation = resource.allocation['N'];
        $scope.resourceNotes = (utilitySrv.isEmpty(resource.notes['S']) || resource.notes['S'] === utilitySrv.emptyString()) ? "" : resource.notes['S'];
        $scope.editingIndex = $index;
        if (email !== '') {
            $scope.isEditing = true;
        }
        
        $scope.isUpdating = true;
    };

    $scope.addNewResource = function () {
        var resource = {
            roleId: {
                N: $scope.resourceRole.id.toString()
            },
            startDate: {
                S: $scope.resourceStartDate.toISOString()
            },
            endDate: {
                S: $scope.resourceEndDate.toISOString()
            },
            allocation: {
                N: $scope.resourceAllocation
            },
            notes: {
                S: utilitySrv.isEmpty($scope.resourceNotes ) ? utilitySrv.emptyString() : $scope.resourceNotes
            }
        };
        var email = ($scope.resourceEmployee.email === '') ? 'N/A' : $scope.resourceEmployee.email;
        if (utilitySrv.isEmpty($scope.editProject.resources)) {
            $scope.editProject.resources = { M: {}};
            $scope.editProject.resources['M'][email] = {
                M: {
                    roles: {
                        L: [
                            {
                                M: resource
                            }
                        ]
                    }
                }
            }
        } else {
            if (!utilitySrv.isEmpty($scope.editProject.resources['M'][email]) && $scope.editProject.resources['M'][email].M.roles.L.length > 0) {
                $scope.editProject.resources.M[email].M.roles.L.push({
                    M: resource
                });
            } else {
                $scope.editProject.resources['M'][email] = {
                    M: {
                        roles: {
                            L: [
                                {
                                    M: resource
                                }
                            ]
                        }
                    }
                }
            }
        }
        clearResources();
    };

    $scope.updateResource = function () {
        var resource = {
            roleId: {
                N: $scope.resourceRole.id.toString()
            },
            startDate: {
                S: $scope.resourceStartDate.toISOString()
            },
            endDate: {
                S: $scope.resourceEndDate.toISOString()
            },
            allocation: {
                N: $scope.resourceAllocation
            },
            notes: {
                S: utilitySrv.isEmpty($scope.resourceNotes ) ? utilitySrv.emptyString() : $scope.resourceNotes
            }
        };
        $scope.editProject.resources.M[$scope.resourceEmployee.email].M.roles.L[$scope.editingIndex].M = resource;

        clearResources();
    };

    $scope.retireResource = function (email, $index) {
        $scope.editProject.resources.M[email].M.roles.L[$index].M.endDate["S"] = (new Date()).toISOString();
    };

    $scope.removeResource = function (email, $index) {
        $scope.editProject.resources.M[email].M.roles.L.splice($index, 1);

        if ($scope.editProject.resources.M[email].M.roles.L.length === 0) {
            delete $scope.editProject.resources.M[email];
        }
    };

    var updateProjectResources = function (projectName) {
        var params = {
            TableName: 'projectResource',
            Item: {
                projectName: {
                    S: projectName
                },
                resources: $scope.editProject.resources
            }
        };
        projectSrv.addResources(params, function (error, project) {
            if (!error) {
                ngNotify.set("Project has been updated successfully");
                $uibModalInstance.close('project updated')
            } else {
                console.log(error);
                ngNotify.set("There seems an issue with the request. Please try again", "error");
            }
        });
    };

    $scope.updateProject = function () {
        if (!$scope.showClientDropdown) {
            var clientParams = {
                TableName: 'client',
                Item: {
                    name: {
                        S: $scope.editProject.clientName['S']
                    },
                    dce: {
                        S: $scope.selectedDCE.email['S']
                    }
                }
            };
            projectSrv.createClient(clientParams, function (error, data) {
                if (error) {
                    console.log(error);
                }
            });
        }
        var params = {
            TableName : "projects",
            Item: {
                name: {
                    S: $scope.editProject.name['S']
                },
                clientName: {
                    S: $scope.editProject.clientName['S']
                },
                platForm: {
                    L: $scope.editProject.platForm['L']
                },
                startDate: {
                    S: $scope.projectStartDate.toISOString()
                },
                endDate: {
                    S: $scope.projectEndDate.toISOString()
                },
                notes: {
                    S: (utilitySrv.isEmpty($scope.editProject.notes) || utilitySrv.isEmpty($scope.editProject.notes['S'])) ? utilitySrv.emptyString() : $scope.editProject.notes['S']
                }
            }
        };

        projectSrv.createProject(params, function (error, data) {
            if (!error) {
                updateProjectResources($scope.editProject.name['S']);
            } else {
                ngNotify.set("There seems an issue with the request. Please try again", "error");
            }
        });
    };
}