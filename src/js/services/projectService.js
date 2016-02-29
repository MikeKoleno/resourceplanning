angular
    .module('RDash.Services')
    .service('projectSrv', ['$http', projectService]);

function projectService($http) {
    return {
        fetch: function () {
            $http.defaults.headers.common['X-Parse-REST-API-Key'] = 'QyGDs2EFoY9AiQRGnM0h1t23l67MNEmd8JV6Gsqq';
            $http.defaults.headers.common['X-Parse-Application-Id'] = 'MTQ2NxMAdMl0wJzMLzdKj37bbpPMUWwSkX96SaSC';
            return $http.get("https://api.parse.com/1/classes/Project?include=Client");
        },
        fetchCount: function () {
            return $http.get("https://api.parse.com/1/classes/Project?count=1&limit=0");
        }
    }
}