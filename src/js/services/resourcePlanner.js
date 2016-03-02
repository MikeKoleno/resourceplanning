angular
    .module('RDash.Services')
    .service('resourcePlanner', [resourcePlanner]);

function resourcePlanner() {
    return {
        init: function () {
            return new AWS.DynamoDB({
                apiVersion: '2012-08-10',
                region: 'us-west-1',
                accessKeyId: 'AKIAI4NOZEHA2Z6LQNHQ',
                secretAccessKey: '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'
            });
        }
    };
};