jumplink.cms.controller('GalleryContentController', function($rootScope, $scope, $state, Fullscreen, $sailsSocket, $stateParams, images, contents, navs, config, FileUploader, $modal, $log, $location, $state, SortableService, GalleryService) {
  $scope.images = images;
  $scope.config = config;
  $scope.contents = contents;
  $scope.navs = navs;
  var page = $state.current.name;
  // $log.debug(images[0]);
  $scope.uploader = new FileUploader({url: 'gallery/upload', removeAfterUpload: true});
  $scope.uploader.filters.push({
    name: 'imageFilter',
    fn: function(item /*{File|FileLikeObject}*/, options) {
      var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
      return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
    }
  });
  var uploadImagesModal = $modal({scope: $scope, title: 'Bilder hinzufügen', uploader: $scope.uploader, template: 'gallery/uploadimagesmodal', show: false});
  var editImageModal = $modal({scope: $scope, title: 'Bild bearbeiten', template: 'gallery/editimagemodal', show: false});

  $scope.aspect = function (image, width)  {
    var height, scale, aspectRatio, win, paddingTopBottom = 0, paddingLeftRight = 0;
    if($scope.isFullScreen(image)) {
      // customised jQuery Method of http://css-tricks.com/perfect-full-page-background-image/
      aspectRatio = image.original.width / image.original.height;
      win = $rootScope.getWindowDimensions();
      if(win.width / win.height < aspectRatio) {
        width = win.width; // width 100%
        scale = image.original.width / width;
        height = image.original.height / scale;
        paddingTopBottom = (win.height - height) / 2;
        height = win.height;
      } else {
        height = win.height;  // height 100%
        scale = image.original.height / height;
        width = image.original.width / scale;
        paddingLeftRight = (win.width - width) / 2;
        width = win.width;
      }
      return {width: width+'px', height: height+'px', 'padding-right': paddingLeftRight+"px", 'padding-left': paddingLeftRight+"px", 'padding-top': paddingTopBottom+"px", 'padding-bottom': paddingTopBottom+"px" };
    } else {
      scale = image.original.width / width;
      height =  image.original.height / scale;
      return {width: width+'px', height: height+'px'};
    }
  }

  $scope.setFullScreen = function(image) {
    // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
    $scope.fullscreenImage = image;
  }

  $scope.closeFullScreen = function(image) {
    Fullscreen.cancel();
  }

  Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled){
    if(!isFullscreenEnabled) {
      delete $scope.fullscreenImage;
    }
    $scope.$apply();
  });

  $scope.isFullScreen = function(image) {
    if(angular.isDefined($scope.fullscreenImage) && angular.isDefined($scope.fullscreenImage.original) && angular.isDefined($scope.fullscreenImage.original.name) && $scope.fullscreenImage.original.name == image.original.name) {
      return true;
    } else {
      return false;
    }
  }

  $scope.edit = function(image) {
    $log.debug("edit", image);
    if($rootScope.authenticated) {
      editImageModal.$scope.image = image;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editImageModal.$promise.then(editImageModal.show);
    }
  }

  $sailsSocket.subscribe('gallery', function(msg){
    $log.debug(msg);

    switch(msg.verb) {
      case 'updated':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde aktualisiert', msg.data.original.name);
      break;
      case 'created':
        // TODO not broadcast / fired why?!
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde hochgeladen', msg.data.original.name);
        $scope.images.push(msg.data);
      break;
      case 'removedFrom':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde entfernt', "");
        $log.debug(msg.data);
      break;
      case 'destroyed':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde gelöscht', "");
        $log.debug(msg.data);
      break;
      case 'addedTo':
        if($rootScope.authenticated)
          $rootScope.pop('success', 'Ein Bild wurde hinzugefügt', "");
        $log.debug(msg.data);
      break;
    }
  });

  var removeFromClient = function (image) {
    var index = $scope.images.indexOf(image);
    $log.debug("removeFromClient", image, index);
    if (index > -1) {
      $scope.images.splice(index, 1);
    }
  }

  $scope.remove = function(image) {
    if($rootScope.authenticated) {
      removeFromClient(image);
      if(image.id) {
        $log.debug(image);
        // WORKAROUND
        image.original.name = image.original.name.replace("Undefined ", "");
        $sailsSocket.delete('/gallery/'+image.id+"?filename="+image.original.name, {id:image.id, filename:image.original.name}).success(function(data, status, headers, config) {
          $log.debug(data);
        });
      }
    }
  }

  $scope.add = function() {
    $log.debug("add");
    uploadImagesModal.$promise.then(uploadImagesModal.show);
  }

  var saveImage = function(image) {
    $sailsSocket.put('/gallery/'+image.id, image).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        $log.debug (data);
      } else {
        $log.error ("Can't save image");
      }
    });
  }

  $scope.save = function(image) {
    if($rootScope.authenticated) {
      if(angular.isUndefined(image)) {  // save all image
        GalleryService.saveAll($scope.images, page, 'test', function (err, images) {
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

  $scope.upload = function(fileItem, image) {
    fileItem.image = image;
    fileItem.upload();
  }

  // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
  $scope.stopPropagation = function (event) {
     event.stopPropagation();
  }


  $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    //fileItem.member.image = response.files[0].uploadedAs;
    console.log(fileItem, response, status, headers);
    // WORKAROUND until the socket method works
    response.forEach(function (file, index, files) {
      var last_position = $scope.images[$scope.images.length-1].position;
      if($rootScope.authenticated) $rootScope.pop('success', 'Ein Bild wurde hochgeladen', file.original.name);
      if(typeof file.position === 'undefined') {
        last_position++;
        file.position = last_position;
      }
      
      $scope.images.push(file);
    });
  };

  // image is set in ng-repeat, this is working :)
  $scope.dropdown = GalleryService.getDropdown();

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

});