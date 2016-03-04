angular
    .module('RDash.Services')
    .service('projectSrv', ['resourcePlanner', projectService]);

function projectService(resourcePlanner) {
    return {
        fetchAllocation: function (email, callback) {
            var params = {
                TableName: "projectResource",
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
        fetchProjectDetails: function (projectId, callback) {
            var params = {
                TableName: "projects",
                ScanFilter: {
                    id: {
                        ComparisonOperator:  'EQ',
                        AttributeValueList: [
                            {
                                N: projectId
                            }
                        ]
                    }
                }
            };
            resourcePlanner.scan(params, callback);
        }
    };
};