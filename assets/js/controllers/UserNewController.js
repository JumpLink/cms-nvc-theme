jumplink.cms.controller('UserNewController', function($scope, UserService, $state, $log) {
  $scope.user = {};
  $scope.save = function(user) {
    if(angular.isUndefined(user))
      user = $scope.user;
    UserService.save(user, function(data) {
      // $scope.user = data;
      $state.go('layout.users');
    });
  }

  UserService.subscribe();
});