angular
    .module('RDash.Services')
    .service('employeeSrv', ['resourcePlanner', employeeService]);

function employeeService(resourcePlanner) {
    return {
        fetch: function (callback) {
            var params = {
                "TableName": "employee"
            };
            resourcePlanner.init().scan(params, function (error, data) {
                return callback(error, data);
            });
        }
    }
}