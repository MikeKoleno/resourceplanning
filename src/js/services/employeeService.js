angular
    .module('RDash.Services')
    .service('employeeSrv', ['resourcePlanner', '$http', employeeService]);

function employeeService(resourcePlanner, $http) {
    return {
        fetchEmployees: function (callback) {
            var params = {
                "TableName": "employee",
                ScanFilter: {
                    active: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [
                            {
                                BOOL: true
                            }
                        ]
                    }
                }
            };
            resourcePlanner.scan(params, callback);
        },
        fetchImageByEmail: function (email) {
            return $http.get("http://picasaweb.google.com/data/entry/api/user/" + email + "?alt=json");
        },
        fetchDCEs: function (callback) {
            var params = {
                TableName: "employeeRoles",
                ScanFilter: {
                    roleId: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [
                            {
                                N: 1
                            }
                        ]
                    }
                }
            };
            resourcePlanner.scan(params, callback);
        },
        fetchEmployeeRoles: function (email, callback) {
            var params = {
                TableName: "employeeRoles",
                ScanFilter: {
                    email: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [
                            {
                                S: email
                            }
                        ]
                    }
                }
            };
            resourcePlanner.scan(params, callback);
        },
        createEmployee: function (data, callback) {
            resourcePlanner.putItem(data, callback);
        },
        assignRolesToEmployee: function (data, callback) {
            resourcePlanner.putItem(data, callback);
        },
        fetchSkills: function (callback) {
            var params = {
                TableName: "skills"
            };
            resourcePlanner.scan(params, callback);
        },
        fetchRoles: function (callback) {
            resourcePlanner.scan({
                TableName: 'roles'
            }, callback);
        },
        fetchMentor: function (email, callback) {
            var params = {
                TableName: 'mentor',
                ScanFilter: {
                    email: {
                        ComparisonOperator: 'EQ',
                        AttributeValueList: [
                            {
                                S: email
                            }
                        ]
                    }
                }
            };

            resourcePlanner.scan(params, callback)
        }
    }
}