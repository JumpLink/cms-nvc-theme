jumplink.cms.controller('AdminController', function($scope, themeSettings, $log, ThemeService) {
  $scope.themeSettings = themeSettings;
  
  $scope.save = function() {
    ThemeService.save($scope.themeSettings.available, function(data) {
      // $scope.themeSettings = data;
      $log.debug(data);
    });
  };
  
});