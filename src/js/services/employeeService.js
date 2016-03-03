angular
    .module('RDash.Services')
    .service('employeeSrv', ['resourcePlanner', 'localStorageService', employeeService]);

function employeeService(resourcePlanner, localStorageService) {
    return {
        fetch: function (callback) {
            var params = {
                "TableName": "employee"
            };
            resourcePlanner.scan(params, function (error, data) {
                localStorageService.set('employees', data);
                return callback(error, data);
            });
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
        }
    }
}