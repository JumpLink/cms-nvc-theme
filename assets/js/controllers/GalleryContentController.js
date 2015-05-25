jumplink.cms.controller('GalleryContentController', function($rootScope, $scope, Fullscreen, $sailsSocket, $stateParams, images, config, FileUploader, $modal, $log, $location, $state) {
  $scope.images = images;
  $scope.config = config;
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
        $log.debug ("Can't save image");
      }
    });
  }

  $scope.save = function(image) {
    if($rootScope.authenticated) {
      if(angular.isUndefined(image)) {  // save all image
        angular.forEach($scope.images, function(image, index) {
          saveImage(image);
        });
      } else { // save just this member
        saveImage(image);
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
  $scope.dropdown = [
    {
      "text": "<i class=\"fa fa-edit\"></i>&nbsp;Bearbeiten",
      "click": "edit(image)"
    },
    {
      "text": "<i class=\"fa fa-trash\"></i>&nbsp;Löschen",
      "click": "$dropdown.hide();$dropdown.destroy();remove(image);" // TODO delay
    },
    {
      "text": "<i class=\"fa fa-floppy-o\"></i>&nbsp;Speichern",
      "click": "save(image)"
    }
  ];


  /* ==== Drag and Drop Stuff ==== */

  // vertausche Bilder
  var swapImages = function (dragimageindex, dragimage, dropimageindex, dropimage) {
    $log.debug(dragimage.position+" <=> "+dropimage.position);

    // swap position too
    var tmp_position = dragimage.position;
    dragimage.position = dropimage.position;
    dropimage.position = tmp_position;

    // IMPORTANT: swap Indexes, too
    $scope.images[dragimageindex] = dropimage;
    $scope.images[dropimageindex] = dragimage;
  }

  $scope.onDragOnImageComplete = function(index, image, evt) {
    if(image == null) {
      $log.debug("*click*", index);
      var image = $scope.images[index];
      $state.go('layout.gallery-fullscreen', {id:image.id});
    }
    // $log.debug("onDragOnImageComplete, image:", image, "index", index);
  }

  $scope.onDropOnImageComplete = function(dropimageindex, dragimage, evt) {
    var dragimageindex = $scope.images.indexOf(dragimage);
    var dropimage = $scope.images[dropimageindex];

    swapImages(dragimageindex, dragimage, dropimageindex, dropimage);
    
    // console.log("onDropOnImageComplete, dragimage:", dragimage, "dragimageindex", dragimageindex, "dropimage", dropimage, "dropimageindex", dropimageindex);
  }

  $scope.onDropOnAreaComplete = function(image, evt) {
    var index = $scope.images.indexOf(image);
    // $log.debug("onDropOnAreaComplete, image:", image, "index", index);
  }

});