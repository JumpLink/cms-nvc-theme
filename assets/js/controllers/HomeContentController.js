jumplink.cms.controller('HomeContentController', function($rootScope, $scope, $sailsSocket, $location, $anchorScroll, $timeout, $window, contents, navs, $state, $log, $filter, $modal, HistoryService, ContentService) {
  var page = $state.current.name;
  $scope.contents = contents;
  // for left navigation with affix, scrollspy and anchor
  $scope.navs = navs;

  $scope.editContentBLockModal = $modal({scope: $scope, title: 'Inhalt bearbeiten', template: 'editcontentmodal', show: false});

  $scope.onlyChars = /^[a-zA-Z]+$/;

  // WORKAROUND wait until image is loaded to fix bs-sidebar
  angular.element($window).imagesLoaded(function() {
    angular.element($window).triggerHandler('resize');
  });

  $scope.goTo = HistoryService.goToHashPosition;

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
    if($scope.html) {
      $scope.contents = ContentService.beautifyEach($scope.contents);
    }
  }

  $scope.add = function() {
    if($rootScope.authenticated) {
      ContentService.add($scope.contents, $scope.editContentBLockModal, page, function(err, content) {
        if(err) $log.error("Error: On add content!", err);
        $log.debug("add done!", content);
      });
    }
  }

  $scope.moveForward = function(index, content) {
    ContentService.moveForward(index, $scope.contents, function(err, contents) {
      if(err) $log.error("Error: On move content forward!", err);
      else $scope.contents = contents;
    });
  }

  $scope.moveBackward = function(index, content) {
    ContentService.moveBackward(index, $scope.contents, function(err, contents) {
      if(err) $log.error("Error: On move content backward!", err);
      else $scope.contents = contents;
    });
  }

  $scope.edit = function(index, content) {
    if($rootScope.authenticated) {
      ContentService.edit($scope.editContentBLockModal, content, function(err) {
        if(err) $log.error("Error: On edit content!", err);
      });
    }
  }

  $scope.remove = function(index, content) {
    if($rootScope.authenticated) {
      ContentService.remove($scope.contents, index, content, page, function (err, removed) {
        if(err) $log.error("Error: On remove content!", err);
        $log.debug("remove done!", removed);
      });
    }
  }

  $scope.save = function(index, content) {
    if($rootScope.authenticated) {
      // Save all contents to be shure all positions are saved
      saveAll(function(err, result) {
        if(err) {
          $log.error("Error: On save all!", err);
          $rootScope.pop('error', 'Seite konnte nicht gespeichert werden', err);
        } else {
          $rootScope.pop('success', 'Seite wurde gespeichert', "");
        }
      });
    }
  }

  $scope.refresh = function(cb) {
    ContentService.refresh($scope.contents, cb);
  }

  var saveAll = function(cb) {
    if($rootScope.authenticated) {
      ContentService.save($scope.contents, page, function(err, contents) {
        if(err) {
          $log.error("Error: On save content!", err);
          if(cb) return cb(err);
          return err;
        }
        saveNavigation(function(err, navs) {
          if(err) {
            $log.error("Error: On save navigation!", err);
            if(cb) return cb(err);
            return err;
          }
          if(cb) cb(null, {contents:contents, navs:navs});
        });
      });
    }
  }

  var saveNavigation = function(cb) {
    $sailsSocket.put('/navigation/replaceall', {navs: $scope.navs, page: page}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        // WORKAROUND until socket event works
        $scope.navs = $filter('orderBy')(data, 'position');
        $log.debug (data);
        $rootScope.pop('success', 'Navigation wurde gespeichert', "");
        if(cb) cb(null, $scope.contents);
      } else {
        var err = 'Navigation konnte nicht gespeichert werden';
        $rootScope.pop('error', err, "");
        $log.error (err);
        if(cb) cb(err);
      }
    });
  }

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug("Content event!", msg);
    switch(msg.verb) {
      case 'updated':
        // switch(msg.id) {
        //   case 'about':
        //     $scope.about = msg.data;
        //     if($rootScope.authenticated) {
        //       $rootScope.pop('success', '"Wir über uns" wurde aktualisiert', "");
        //     }
        //   break;
        //   case 'goals':
        //     $scope.goals = msg.data;
        //     if($rootScope.authenticated) {
        //       $rootScope.pop('success', '"Ziele" wurde aktualisiert', "");
        //     }
        //   break;
        // }
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Seite wurde aktualisiert', msg.id);
        }
      break;
    }
  });

});