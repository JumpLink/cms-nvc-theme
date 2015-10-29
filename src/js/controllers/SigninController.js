jumplink.cms.controller('SigninController', function($rootScope, $scope, $log, $stateParams, SigninService, $state, HistoryService) {
  $scope.error = $stateParams.error;

  $scope.signin = function () {
    $log.debug($scope.user);
    // $scope.user.role = 'superadmin';
    SigninService.signin($scope.user, true, true, $rootScope, function (error, result) {
      if(error) {
        $scope.error = error;
        return $scope.error;
      }
      $rootScope.authenticated = result.authenticated;
      $rootScope.user = result.user;
      $rootScope.site = result.site;
      $log.debug("[SigninController.signin]", result);
    });
  };
});