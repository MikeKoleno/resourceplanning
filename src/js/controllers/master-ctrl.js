/**
 * Master Controller
 */

angular.module('RDash')
    .controller('MasterCtrl', ['$scope', '$cookieStore', 'projectSrv', 'employeeSrv', MasterCtrl]);

function MasterCtrl($scope, $cookieStore, projectSrv, employeeSrv) {
    /**
     * Sidebar Toggle & Cookie Control
     */
    var mobileView = 992;

    $scope.getWidth = function() {
        return window.innerWidth;
    };

    $scope.$watch($scope.getWidth, function(newValue, oldValue) {
        if (newValue >= mobileView) {
            if (angular.isDefined($cookieStore.get('toggle'))) {
                $scope.toggle = ! $cookieStore.get('toggle') ? false : true;

            } else {
                $scope.toggle = true;
            }
        } else {
            $scope.toggle = false;
        }

    });

    $scope.fetchProjects = function () {
        projectSrv.fetch().then(function (response) {
            $scope.projects = response.data.results;

            if (!$scope.$$phase) {
                $scope.$$digest();
            }
        })
    };
    $scope.fetchProjects();

    $scope.fetchEmployees = function () {
        employeeSrv.fetch().then(function (response) {
            $scope.employees = response.data.results;

            if (!$scope.$$phase) {
                $scope.$$digest();
            }
        })
    };

    $scope.fetchEmployees();

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    window.onresize = function() {
        $scope.$apply();
    };
}