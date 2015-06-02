jumplink.cms.service('GalleryService', function ($rootScope, $sailsSocket, $async, Fullscreen, SortableService, FileUploader, $modal, $log) {

  var editModal = null, uploadModal = null, fullscreenImage = null;

  var dropdown = [
    {
      "text": "<i class=\"fa fa-edit\"></i>&nbsp;Bearbeiten",
      "click": "editImage(image)"
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

  var getDropdown = function () {
    return dropdown;
  }

  var setEditModal = function($scope) {
    editModal = $modal({scope: $scope, title: 'Bild bearbeiten', template: 'gallery/editimagemodal', show: false});
    return getEditModal();
  }

  var getEditModal = function() {
    return editModal;
  }

  var setUploadModal = function($scope, images, cb) {

    $scope.uploader = new FileUploader({url: 'gallery/upload', removeAfterUpload: true});
    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function(item /*{File|FileLikeObject}*/, options) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });

    $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
      //fileItem.member.image = response.files[0].uploadedAs;
      console.log(fileItem, response, status, headers);
      // WORKAROUND until the socket method works
      response.forEach(function (file, index, files) {
        var last_position = images[images.length-1].position;
        if($rootScope.authenticated) $rootScope.pop('success', 'Ein Bild wurde hochgeladen', file.original.name);
        if(typeof file.position === 'undefined') {
          last_position++;
          file.position = last_position;
        }
        
        images.push(file);
      });
    };

    $scope.upload = function(fileItem, image) {
      fileItem.image = image;
      fileItem.upload();
    }

    uploadModal = $modal({scope: $scope, title: 'Bilder hinzufügen', uploader: $scope.uploader, template: 'gallery/uploadimagesmodal', show: false});
    return getUploadModal();
  }

  var getUploadModal = function() {
    return uploadModal;
  }

  var fix = function(image, page, contentname, cb) {
    if(!image.page || image.page === "") {
      image.page = page;
    }

    if(!image.content || image.content === "") {
      image.content = contentname;
    }

    if(cb) cb(null, image);
    else return image;
  }

  // var setFullScreen = function(image) {
  //   // http://stackoverflow.com/questions/21702375/angularjs-ng-click-over-ng-click
  //   fullscreenImage = image;
  // }

  // var closeFullScreen = function(image) {
  //   Fullscreen.cancel();
  // }

  // Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled){
  //   if(!isFullscreenEnabled) {
  //     delete fullscreenImage;
  //   }
  //   $scope.$apply();
  // });

  // var isFullScreen = function(image) {
  //   if(angular.isDefined($scope.fullscreenImage) && angular.isDefined($scope.fullscreenImage.original) && angular.isDefined($scope.fullscreenImage.original.name) && $scope.fullscreenImage.original.name == image.original.name) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  var saveOne = function(image, page, contentname, cb) {

    image = fix(image, page, contentname);

    var errors = [
      'Bild konnte nicht gespeichert werden'
    ];

    $sailsSocket.put('/gallery/'+image.id, image).success(function(data, status, headers, config) {
      if(angular.isArray(data)) data = data[0];
      $log.debug (data);
      if(cb) cb(null, data);
    }).
    error(function(data, status, headers, config) {
      $log.error (errors[0], data);
      if(cb) cb(errors[0], data);
    });
  }

  var saveAll = function(images, page, contentname, cb) {
    $async.map(images,
    function iterator(image, cb) {
      saveOne(image, page, contentname, cb);
    }, cb);
  }

  var remove = function(images, index, image, page, cb) {
    if(typeof(index) === 'undefined' || index === null) {
      index = images.indexOf(image);
    }
    images = SortableService.remove(images, index, image);
    // if image has an id it is saved on database, if not, not
    if(image.id) {
      $log.debug("remove from server, too" ,image);
      $sailsSocket.delete('/gallery/'+image.id+"?filename="+image.original.name+"&page="+page, {id:image.id, filename:image.original.name, page: page}).success(function(data, status, headers, config) {
        if(cb) cb(null, images)
      }).
      error(function(data, status, headers, config) {
        $log.error (errors[0], data);
        if(cb) cb(data);
      });;
    } else {
      if(cb) cb(null, images);
    }
  };

  var add = function(cb) {
    // $log.debug("add");
    uploadModal.$promise.then(uploadModal.show);

    uploadModal.$scope.$on('modal.hide',function(){
      $log.debug("upload modal closed");
      if(cb) cb();
    });
  }

  var edit = function(image, cb) {
    $log.debug("edit", image);
    editModal.$scope.image = image;
    //- Show when some event occurs (use $promise property to ensure the template has been loaded)
    editModal.$promise.then(editModal.show);

    editModal.$scope.$on('modal.hide',function(){
      $log.debug("edit closed");
      if(cb) cb(null, editModal.$scope.image);
    });
  }

  var aspect = function (image, width)  {
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

  var subscribe = function () {
    $sailsSocket.subscribe('gallery', function(msg) {
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
  } 

  return {
    getDropdown: getDropdown,
    setEditModal: setEditModal,
    getEditModal: getEditModal,
    setUploadModal: setUploadModal,
    getUploadModal: getUploadModal,
    saveOne: saveOne,
    saveAll: saveAll,
    remove: remove,
    add: add,
    edit: edit,
    aspect: aspect,
    subscribe: subscribe
  };
});