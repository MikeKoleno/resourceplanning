angular.module("RDash")
    .controller("HeaderController", ["$rootScope", "$scope", "$uibModal", "ngNotify", headerController]);

function headerController($rootScope, $scope, $uibModal, ngNotify) {

    var createModal;

    (function () {
        ngNotify.config({
            theme: 'pure',
            position: 'top',
            duration: 3000,
            type: 'success',
            sticky: false,
            button: true,
            html: false
        });
    })();

    $scope.openEmployeeCreateModal = function () {
        createModal = $uibModal.open({
            animation: true,
            templateUrl: 'templates/employee-create-modal.tpl.html',
            controller: "EmployeeCreateModalController",
            size: 'lg',
            resolve: {
                modalType: function () {
                    return 'Employee';
                }
            }
        });

        createModal.result.then(function (message) {
            if (message === 'employee created') {
                ngNotify.set('Employee created successfully');
                $rootScope.$broadcast("refresh", "dashboard");
            }
        });
    };
    
    $scope.openProjectCreateModal = function () {
        createModal = $uibModal.open({
            animation: true,
            templateUrl: 'templates/project-create-modal.tpl.html',
            controller: "ProjectCreateModalController",
            size: 'lg',
            resolve: {
                modalType: function () {
                    return 'Project'
                }
            }
        });

        createModal.result.then(function (message) {
            if (message === 'project created') {
                ngNotify.set('Project created successfully');
                $rootScope.$broadcast("refresh", "dashboard");
            }
        });
    };


}

