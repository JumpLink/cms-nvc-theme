jumplink.cms.service('HistoryService', function ($window, $location, $anchorScroll) {
  var back = function () {
    $window.history.back();
  }

  var goToHashPosition = function (hash) {
    // $log.debug("go to hash", hash);
    $location.hash(hash);
    $anchorScroll.yOffset = 60;
    $anchorScroll();
  }

  return {
    back: back
    , goToHashPosition: goToHashPosition
  };
});