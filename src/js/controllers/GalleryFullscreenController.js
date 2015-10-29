jumplink.cms.controller('GalleryFullscreenController', function($scope, $log, image, config) {
  $scope.image = image;
  $scope.config = config;
  $log.debug("[GalleryFullscreenController] image", image);
});