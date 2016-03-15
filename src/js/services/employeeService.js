angular
    .module('RDash.Services')
    .service('employeeSrv', ['resourcePlanner', employeeService]);

function employeeService(resourcePlanner) {
    return {
        fetchEmployees: function (callback) {
            var params = {
                "TableName": "employee"
            };
            resourcePlanner.scan(params, callback);
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
        }
    }
}