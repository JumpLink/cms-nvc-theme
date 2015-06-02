jumplink.cms.controller('GalleryContentController', function($rootScope, $scope, $state, Fullscreen, $sailsSocket, $stateParams, images, contents, navs, config, $modal, $log, $location, $state, SortableService, GalleryService, ContentService, SubnavigationService) {
  $scope.images = images;
  $scope.config = config;
  $scope.contents = contents;
  $scope.navs = navs;
  $scope.html = ContentService.getShowHtml();
  $scope.dropdown = GalleryService.getDropdown();

  var page = $state.current.name;

  GalleryService.setEditModal($scope);
  GalleryService.setUploadModal($scope, $scope.images);
  GalleryService.subscribe();

  ContentService.setEditModal($scope);
  ContentService.subscribe();

  SubnavigationService.setEditModal($scope);
  SubnavigationService.subscribe();

  $scope.toogleHtml = function() {
    $scope.html = ContentService.toogleShowHtml($scope.contents);
  }

  $scope.remove = function(image) {
    if($rootScope.authenticated) {
      GalleryService.remove($scope.images, null, image, page, function (err, images) {
        if(err) {
          $log.error("Error: On remove content!", err);
          $rootScope.pop('error', 'Bild konnte nicht entfernt werden', "");
        } else{
          $rootScope.pop('success', 'Bild wurde entfernt', "");
          $scope.images = images;
        }
      });
    }
  }

  var addImage = function() {
    if($rootScope.authenticated) {
      GalleryService.add(function(err, image) {
        if(err) $log.error("Error: On image content!", err);
      });
    }
  }

  var addContent = function() {
    if($rootScope.authenticated) {
      ContentService.add($scope.contents, page, function(err, content) {
        if(err) $log.error("Error: On add content!", err);
        $log.debug("add done!", content);
      });
    }
  }

  $scope.addNav = function() {
    if($rootScope.authenticated) {
      SubnavigationService.add($scope.navs, {page:page}, function(err, content) {
        if(err) $log.error("Error: On add content!", err);
        $log.debug("add done!", content);
      });
    }
  }

  $scope.moveForwardContent = function(index, content) {
    SortableService.moveForward(index, $scope.contents, function(err, contents) {
      if(err) $log.error("Error: On move content forward!", err);
      else $scope.contents = contents;
    });
  }

  $scope.moveForwardNav = function(index, nav) {
    SortableService.moveForward(index, $scope.navs, function(err, navs) {
      if(err) $log.error("Error: On move subnavigation forward!", err);
      else $scope.navs = navs;
    });
  }

  $scope.moveBackwardContent = function(index, content) {
    SortableService.moveBackward(index, $scope.contents, function(err, contents) {
      if(err) $log.error("Error: On move content backward!", err);
      else $scope.contents = contents;
    });
  }

  $scope.moveBackwardNav = function(index, nav) {
    SortableService.moveBackward(index, $scope.navs, function(err, navs) {
      if(err) $log.error("Error: On move content backward!", err);
      else $scope.navs = navs;
    });
  }

  $scope.editImage = GalleryService.edit;

  $scope.editContent = function(index, content) {
    if($rootScope.authenticated) {
      ContentService.edit(content, function(err) {
        if(err) $log.error("Error: On edit content!", err);
      });
    }
  }

  $scope.editNavs = function(navs) {
    if($rootScope.authenticated) {
      SubnavigationService.edit(navs, function(err) {
        if(err) $log.error("Error: On edit subnavigations!", err);
      });
    }
  }


  $scope.save = function(image) {
    var contentname = 'test';
    if($rootScope.authenticated) {
      if(angular.isUndefined(image)) {  // save all image
        GalleryService.saveAll($scope.images, page, contentname, function (err, images) {
          if(err) {
            $log.error (err, images);
            $rootScope.pop('error', err, images);
          } else {
            $rootScope.pop('success', 'Bilder wurden aktualisiert', '');
          }

        });
      } else { // save just this member
        GalleryService.saveOne(image, page, contentname, function (err, image) {
          if(err) {
            $log.error (err, image);
            $rootScope.pop('error', err, image);
          } else {
            $rootScope.pop('success', 'Bild wurde aktualisiert', '');
          }
        });
      }
    }
  }

  // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
  $scope.stopPropagation = function (event) {
     event.stopPropagation();
  }

  /* ==== Drag and Drop Stuff ==== */
  $scope.onDragOnImageComplete = function(index, image, evt) {
    if(image == null) {
      $log.debug("*click*", index);
      var image = $scope.images[index];
      $state.go('layout.gallery-fullscreen', {id:image.id});
    }
  }

  $scope.onDropOnImageComplete = function(dropimageindex, dragimage, evt) {
    SortableService.onDropComplete($scope.images, dropimageindex, dragimage, evt, function(err, images) {
      $scope.images = images;
    });
  }

  $scope.onDropOnAreaComplete = function(image, evt) {
    var index = $scope.images.indexOf(image);
    $log.debug("onDropOnAreaComplete, image:", image, "index", index);
  }

  $scope.addDropdownActions = {
    'addImage': addImage,
    'addContent': addContent
  }

  $scope.addDropdown = [
    {
      "text": "<i class=\"fa fa-file-image-o\"></i>&nbsp;Bild",
      "click": "addDropdownActions.addImage()"
    },
    {
      "text": "<i class=\"fa fa-header\"></i>&nbsp;Überschrift",
      "click": "addDropdownActions.addContent()"
    }
  ];

});