jumplink.cms.service('HistoryService', function ($window) {
  var back = function () {
    $window.history.back();
  }

  return {
    back: back
  };
});