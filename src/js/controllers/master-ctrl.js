/**
 * Master Controller
 */

angular.module('RDash')
    .controller('MasterCtrl', ['$scope', '$state', '$cookieStore', 'projectSrv', 'employeeSrv', MasterCtrl]);

function MasterCtrl($scope, $state, $cookieStore, projectSrv, employeeSrv) {
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

    $scope.$on("spinner", function (event, message) {
        if (message === 'show') {
            $scope.isPageLoading = true;
        } else {
            $scope.isPageLoading = false;
        }if (!$scope.$$phase) {
            $scope.$digest();
        }
    });

    $scope.toggleSidebar = function() {
        $scope.toggle = !$scope.toggle;
        $cookieStore.put('toggle', $scope.toggle);
    };

    $scope.isActiveNav = function () {
        return $state.current.name;
    };

    window.onresize = function() {
        $scope.$apply();
    };
}