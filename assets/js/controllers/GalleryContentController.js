jumplink.cms.controller('GalleryContentController', function($rootScope, $scope, $state, Fullscreen, $sailsSocket, $stateParams, contents_images, navs, config, $modal, $log, $location, $state, SortableService, GalleryService, ContentService, SubnavigationService) {
  $scope.images = contents_images.images;;
  $scope.config = config;
  $scope.contents = contents_images.contents;
  $scope.navs = navs;
  $scope.html = ContentService.getShowHtml();
  $scope.dropdown = GalleryService.getDropdown();

  console.log($scope.contents);

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
  };

  $scope.remove = function(image, content) {
    if($rootScope.authenticated) {
      GalleryService.remove($scope.images[content.name], null, image, page, function (err, images) {
        if(err) {
          $log.error("Error: On remove content!", err);
          $rootScope.pop('error', 'Bild konnte nicht entfernt werden', "");
        } else{
          $rootScope.pop('success', 'Bild wurde entfernt', "");
          $scope.images[content.name] = images;
        }
      });
    }
  };

  var addImage = function() {
    if($rootScope.authenticated) {
      GalleryService.add(function(err, image) {
        if(err) $log.error("Error: On image content!", err);
      });
    }
  };

  var addContent = function() {
    var errors = [
      "Error: Konnte Inhaltsblock nicht erzeugen",
      "Error: Konnte Inhaltsblock nicht hinzufügen",
    ];
    if($rootScope.authenticated) {
      ContentService.createEdit($scope.contents, page, function(err, content) {
        if(err) {
          $log.error(errors[0], err);
          $rootScope.pop('error', errors[0], err);
          $scope.$apply();
        } else {
          ContentService.append($scope.contents, content, function (err, contents) {
            if(err) {
              $log.error(errors[1], err);
              $rootScope.pop('error', errors[1], err);
              $scope.$apply();
            } else {
              $scope.contents = contents;
              $rootScope.pop('success', 'Neuer Inhaltsblock wurde hinzugefügt', content.title);
              $scope.$apply();

              GalleryService.addBlock($scope.images, content, function(err, imageBock) {
                if(err) $log.error("Error: On add image block!", err);
                $log.debug("add done!", content, imageBock);
              });
            }
          });  
        }
      });
    }
  };

  $scope.addNav = function() {
    if($rootScope.authenticated) {
      SubnavigationService.add($scope.navs, {page:page}, function(err, content) {
        if(err) $log.error("Error: On add content!", err);
        $log.debug("add done!", content);
      });
    }
  };

  $scope.moveForwardContent = function(index, content) {
    SortableService.moveForward(index, $scope.contents, function(err, contents) {
      if(err) $log.error("Error: On move content forward!", err);
      else $scope.contents = contents;
    });
  };

  $scope.moveForwardNav = function(index, nav) {
    SortableService.moveForward(index, $scope.navs, function(err, navs) {
      if(err) $log.error("Error: On move subnavigation forward!", err);
      else $scope.navs = navs;
    });
  };

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
  };

  $scope.editImage = GalleryService.edit;

  $scope.editContent = function(index, content) {
    if($rootScope.authenticated) {
      ContentService.edit(content, function(err, newContent) {
        if(err) $log.error("Error: On edit content!", err);
        else {
          content = newContent;
        }
      });
    }
  };

  $scope.editNavs = function(navs) {
    if($rootScope.authenticated) {
      SubnavigationService.edit(navs, function(err) {
        if(err) $log.error("Error: On edit subnavigations!", err);
      });
    }
  };

  $scope.saveImage = function(image) {
    var contentname = 'test';
    if($rootScope.authenticated) {
      if(angular.isDefined(image)) {  
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
  };


  $scope.save = function() {
    var contentname = 'test';
    if($rootScope.authenticated) {
      GalleryService.saveAllBlocks($scope.images, page, function (err, images) {
        if(err) {
          $log.error (err, images);
          $rootScope.pop('error', err, images);
        } else {
          $log.debug ("Bilder wurden aktualisiert", images);
          $rootScope.pop('success', 'Bilder wurden aktualisiert', '');
          ContentService.save($scope.contents, page, function(err, contents) {
            if(err) {
              $log.error("Error: On save content!", err);
              if(cb) return cb(err);
              return err;
            } else {
              $log.debug ('Contentblocks wurden aktualisiert', contents);
              $rootScope.pop('success', 'Contentblocks wurden aktualisiert', '');
            }
          });
        }
      });
    }
  };

  // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
  $scope.stopPropagation = function (event) {
     event.stopPropagation();
  };

  $scope.goToImage = function (image) {
    $state.go('layout.gallery-fullscreen', {id:image.id});
  }

  /* ==== Drag and Drop Stuff ==== */
  $scope.onDragOnImageComplete = function(index, image, evt, content) {
    if(image == null) {
      $log.debug("*click*", index);
      var image = $scope.images[content.name][index];
      $scope.goToImage(image);
    }
  };

  $scope.onDropOnImageComplete = function(dropimageindex, dragimage, evt, content) {


    SortableService.dropMove($scope.images[content.name], dropimageindex, dragimage, evt, function(err, images) {
      $scope.images[content.name] = images;
    }, SortableService.move);
  };

  $scope.onDropOnAreaComplete = function(image, evt, content) {
    $log.debug("onDropOnAreaComplete");
    // $log.debug("images", $scope.images);
    // $log.debug("content", content);

    // var index = $scope.images[content.name].indexOf(image);

    if(image !== null && image.content != content.name) {
      $log.debug("Move image from one content block to another:\n\t"+image.content+" => "+content.name);
      var content_from = image.content;
      var content_to = content.name;
      SortableService.moveObjectToAnotherArray(image, null, $scope.images[content_from], $scope.images[content_to], function (err, result) {
        if(err) $rootScope.pop('error', "Bild konnte nicht verschoben werden", err);
        else {
          result.array_to[result.index_to].content = content_to;
          $rootScope.pop('success', "Bild erfolgreich verschoben", content_from+" => "+content_to);
        }
        $scope.$apply();
      });
    } else {
      $log.debug("Move image within the content block:\n\t"+content.name);
    }
    


  };

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