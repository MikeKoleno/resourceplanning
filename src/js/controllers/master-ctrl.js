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
        $scope.projects = [];
    };
    $scope.fetchProjects();

    $scope.fetchEmployees = function () {
        employeeSrv.fetch(function (error, data) {
            if (!error) {
                $scope.employees = data.Items;

                if (!$scope.$$phase) {
                    $scope.$digest();
                }
            }
        });
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