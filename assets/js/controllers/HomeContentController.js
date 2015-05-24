jumplink.cms.controller('HomeContentController', function($rootScope, $scope, $sailsSocket, $location, $anchorScroll, $timeout, $window, contents, navs, $state, $log, $filter, $modal) {
  var page = $state.current.name;
  $scope.contents = contents;
  // for left navigation with affix, scrollspy and anchor
  $scope.navs = navs;

  var editContentBLockModal = $modal({scope: $scope, title: 'Inhalt bearbeiten', template: 'editcontentmodal', show: false});

  $scope.onlyChars = /^[a-zA-Z]+$/;

  // WORKAROUND wait until image is loaded to fix bs-sidebar
  angular.element($window).imagesLoaded(function() {
    angular.element($window).triggerHandler('resize');
  });

  $scope.goTo = function (hash) {
    // $log.debug("go to hash", hash);
    $location.hash(hash);
    $anchorScroll.yOffset = 60;
    $anchorScroll();
  }

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
    if($scope.html) {
      $scope.contents = beautifyContents($scope.contents);
    }
  }

  var beautifyContent = function(content, cb) {
    content.content = html_beautify(content.content);
    if(cb) cb(null, content);
    else return content;
  }

  var beautifyContents = function(contents, cb) {
    for (var i = contents.length - 1; i >= 0; i--) {
      contents[i].content = beautifyContent(contents[i].content);
    };
    if(cb) cb(null, contents);
    else return contents;
  }

  $scope.add = function() {
    var new_index = $scope.contents.length;
    $scope.contents.push({
      position: $scope.contents[new_index-1].position+1,
      content: "",
      title: "",
      name: "",
      page: $state.current.name
    });
    $scope.edit(new_index, $scope.contents[new_index]);
  }

  $scope.swap = function(index_1, index_2) {

    var content_1 = $scope.contents[index_1];
    var content_2 = $scope.contents[index_2];

    // swap position too
    var position_tmp = content_1.position;
    content_1.position = content_2.position;
    content_2.position = position_tmp;

    // IMPORTANT: swap Indexes, too
    $scope.contents[index_1] = content_2;
    $scope.contents[index_2] = content_1;
  }

  $scope.moveForward = function(index, content) {
    if(index + 1 < $scope.contents.length ) {
      $scope.swap(index, index+1);
    }
  }

  $scope.moveBackward = function(index, content) {
    if(index - 1 >= 0) {
      $scope.swap(index, index-1);
    }
  }

  $scope.edit = function(index, content) {
    $log.debug("edit", content);
    if($rootScope.authenticated) {
      editContentBLockModal.$scope.content = content;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editContentBLockModal.$promise.then(editContentBLockModal.show);
    }
  }

  var removeFromClient = function (index, content) {
    $log.debug("removeFromClient", index, content);
    if (index > -1) {
      $scope.contents.splice(index, 1);
    }
  }

  $scope.remove = function(index, content) {
    if(typeof(index) === 'undefined' || index === null) {
      index = $scope.contents.indexOf(content);
    }
    if($rootScope.authenticated) {
      removeFromClient(index, content);
      // if content has an id it is saved on database, if not, not
      if(content.id) {
        $log.debug("remove from server, too" ,content);
        $sailsSocket.delete('/content/'+content.id+"?page="+page, {id:content.id, page: page}).success(function(data, status, headers, config) {
          $log.debug(data);
        });
      }
    }
  }

  $scope.save = function(index, content) {
    // Save all contents to be shure all positions are saved
    saveAll(function(err, result) {

    });
  }

  $scope.refresh = function(cb) {
    fixContents($scope.contents, function(err, contents) {
      if(err) {
        $log.error(err);
        if(cb) cb(err);
        else return err;
      }
      beautifyContents($scope.contents, function(err, contents) {
        if(err) {
          $log.error(err);
          if(cb) cb(err);
          else return err;
        } else {
          if(cb) cb(null, contents);
          else return contents;
        }
      });
    });
  }

  var saveAll = function(cb) {
    saveContents(function(err, contents) {
      if(err) if(cb) return cb(err); return err;
      saveNavigation(function(err, navs) {
        if(err) if(cb) return cb(err); return err;
        if(cb) cb(null, {contents:contents, navs:navs});
      });
    });
  }

  var fixContent = function(content, cb) {
    if(!content.name || content.name === "") {
      var re = new RegExp("^[a-zA-Z]$");
      content.name = content.title.toLowerCase().replace(/[^a-zA-Z]+/g, '');
      $log.debug("set content.name to", content.name);
    }
    if(cb) cb(null, content);
    else return content;
  }

  var fixContents = function(contents, cb) {
    for (var i = contents.length - 1; i >= 0; i--) {
      contents[i] = fixContent(contents[i]);
    };
    if(cb) cb(null, contents);
    else return contents;
  }

  var saveContents = function(cb) {
    fixContents($scope.contents, function(err, contents) {
      if(err)
        if(cb) cb(err);
        else return err;
      $sailsSocket.put('/content/replaceall', {contents: contents, page: page}).success(function(data, status, headers, config) {
        if(data != null && typeof(data) !== "undefined") {
          // WORKAROUND until socket event works
          $scope.contents = $filter('orderBy')(data, 'position');
          $log.debug (data);
          $rootScope.pop('success', 'Seite wurde gespeichert', "");
          if(cb) cb(null, $scope.contents);
        } else {
          var err = 'Seite konnte nicht gespeichert werden';
          rootScope.pop('error', err, "");
          $log.error (err);
          if(cb) cb(null, err);
        }
      });
    });
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