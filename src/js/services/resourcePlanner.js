angular
    .module('RDash.Services')
    .service('resourcePlanner', [resourcePlannerService]);

function resourcePlannerService() {
    var planner = new AWS.DynamoDB({
        apiVersion: '2012-08-10',
        region: 'us-west-1',
        accessKeyId: 'AKIAI4NOZEHA2Z6LQNHQ',
        secretAccessKey: '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'
    });
    return {
        scan: function (params, callback) {
            planner.scan(params, callback);
        }
    };
};