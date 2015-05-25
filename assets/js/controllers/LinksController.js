jumplink.cms.controller('LinksController', function($rootScope, $scope, $sailsSocket, links, $location, $anchorScroll, $state, $log) {
  var page = $state.current.name;
  $scope.links = links;

  $scope.goTo = function (hash) {
    $location.hash(hash);
    $anchorScroll.yOffset = 60;
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $scope.links.page = page;
    $sailsSocket.put("/content/replace", $scope.links, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        $log.debug (response);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'links':
            $scope.links = msg.data;
            if($rootScope.authenticated) {
              $rootScope.pop('success', 'Links-Text wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

});