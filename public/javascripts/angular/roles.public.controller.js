'use strict';

angular.module('roles',['ui.bootstrap'])
    .controller('rolesController', ['$scope','$http','$modal',
    function($scope, $http, $modal) {
        $scope.sys_adminPermission = [];
        $scope.developerPermission = [];
        $scope.administratorPermission = [];
        $scope.managersPermission = [];



        $scope.sys_adminNewPermissionText = "";
        $scope.developerNewPermissionText = "";
        $scope.administratorNewPermissionText = "";
        $scope.managerNewPermissionText = "";

        function onLoad(){
            $http.get('/roles/sys_admin/getpermission').then(function (data) {
                $scope.sys_adminPermission = data.data.data;
            });
            $http.get('/roles/developer/getpermission').then(function (data) {
                $scope.developerPermission = data.data.data;
            });
            $http.get('/roles/administrator/getpermission').then(function (data) {
                $scope.administratorPermission = data.data.data;
            });
            $http.get('/roles/manager/getpermission').then(function (data) {
                $scope.managersPermission = data.data.data;
            });
        }


        $scope.deletePermission = function (permission, role) {
            $http.delete('/roles/'+role+'/'+permission._id+'/deletepermission').then(function () {
                let permissionToUse = null;
                if(role == "developer"){
                    permissionToUse = $scope.developerPermission;
                } else if (role == "sys_admin"){
                    permissionToUse = $scope.sys_adminPermission;
                } else if (role == "administrator"){
                    permissionToUse = $scope.administratorPermission;
                } else if (role == "manager"){
                    permissionToUse = $scope.managersPermission;
                } else {
                    throw new Error("NO ROLE FOUNDED")
                }
                let index = permissionToUse.indexOf(permission);
                permissionToUse.splice(index,1);
            });
        };

        $scope.addPermission = function(role){
            let text = "";
            let arrayToWork = [];
            if(role == "developer"){
                text = $scope.developerNewPermissionText;
                arrayToWork = $scope.developerPermission;
                $scope.developerNewPermissionText = "";
            } else if (role == "sys_admin"){
                text = $scope.sys_adminNewPermissionText;
                arrayToWork = $scope.sys_adminPermission;
                $scope.sys_adminNewPermissionText = "";
            } else if (role == "administrator"){
                text = $scope.administratorNewPermissionText;
                arrayToWork = $scope.administratorPermission;
                $scope.administratorNewPermissionText = "";
            } else if (role == "manager"){
                text = $scope.managerNewPermissionText;
                arrayToWork = $scope.managersPermission;
                $scope.managerNewPermissionText = "";
            } else {
                throw new Error("NO ROLE FOUNDED")
            }
            $http.post('/roles/'+role+'/'+text+'/addpermission').then(function (data) {
                arrayToWork.push(data.data);
            })
        };

        onLoad();
    }
]);