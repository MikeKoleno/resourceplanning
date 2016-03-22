angular
    .module('RDash.Services')
    .service('projectSrv', ['resourcePlanner', projectService]);

function projectService(resourcePlanner) {
    return {
        fetchAllocation: function (email, callback) {
            var params = {
                TableName: "projectResource"
            };
            resourcePlanner.scan(params, function (error, data) {
                var results = [];
                if (!error) {
                    data.Items.map(function (item) {
                        if (item.resources.M[email.toString()]) {
                            results.push(item);
                        }
                    });
                    callback(error, results);
                }
            });
        },
        fetchProjectDetails: function (projectName, callback) {
            var params = {
                TableName: "projects",
                ScanFilter: {
                    name: {
                        ComparisonOperator:  'EQ',
                        AttributeValueList: [
                            {
                                S: projectName
                            }
                        ]
                    }
                }
            };
            resourcePlanner.scan(params, callback);
        },
        fetchClients : function (callback) {
            var params = {
                TableName: 'client'
            };
            resourcePlanner.scan(params, callback);
        },
        createClient: function (params, callback) {
            resourcePlanner.putItem(params, callback);
        },
        createProject : function (params, callback) {
            resourcePlanner.putItem(params, callback);
        },
        addResources : function (params, callback) {
            resourcePlanner.putItem(params, callback);
        }
    };
};