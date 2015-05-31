jumplink.cms.service('GalleryService', function ($sailsSocket, $async, $log) {

  // image is set in ng-repeat, this is working :)
  var dropdown = [
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

  var getDropdown = function () {
    return dropdown;
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
    angular.forEach(images, function(image, index) {
      saveOne(image);
    });

    $async.map(images,
    function iterator(image, cb) {
      saveOne(image, page, contentname, cb);
    }, cb);
  }

  return {
    getDropdown: getDropdown,
    saveOne: saveOne,
    saveAll: saveAll,
  };
});