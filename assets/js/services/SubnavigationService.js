jumplink.cms.service('SubnavigationService', function ($rootScope, $window, $log, $sailsSocket, $filter, $modal, SortableService) {

  var editModal = null;

  var setEditModal = function($scope) {
    editModal = $modal({scope: $scope, title: 'Navigation bearbeiten', template: 'editsubnavigationmodal', show: false});
    return getEditModal();
  };

  var getEditModal = function() {
    return editModal;
  };

  var subscribe = function() {
    // called on content changes
    $sailsSocket.subscribe('navigation', function(msg){
      $log.debug("Navigation event!", msg);
      switch(msg.verb) {
        case 'updated':
          if($rootScope.authenticated) {
            $rootScope.pop('success', 'Navigation wurde aktualisiert', msg.id);
          }
        break;
      }
    });
  };

  // WORKAROUND wait until image is loaded to fix bs-sidebar
  var resizeOnImagesLoaded = function () {
    angular.element($window).imagesLoaded(function() {
      angular.element($window).triggerHandler('resize');
    });
  };

  var create = function(page) {
    var data = {
      target: "",
      name: "",
      page: page
    };
    return data;
  }

  var append = function(navs, data, cb) {

    if(!data || !data.target) data.target = "";
    if(!data || !data.name) data.name = "";
    if(!data || !data.page) cb("Page not set.")

    $log.debug("data", data);

    SortableService.append(navs, data, cb);
  };


  var swap = function(navs, index_1, index_2, cb) {
    return SortableService.swap(contents, index_1, index_2, cb);
  };

  var moveForward = function(index, navs, cb) {
    return SortableService.moveForward(index, navs, cb);
  };

  var moveBackward = function(index, navs, cb) {
    return SortableService.moveBackward(index, navs, cb);
  };

  var edit = function(navs, cb) {
    $log.debug("edit subnavigations", navs);
    editModal.$scope.navs = navs;
    //- Show when some event occurs (use $promise property to ensure the template has been loaded)
    editModal.$promise.then(editModal.show);

    editModal.$scope.$on('modal.hide',function(){
      $log.debug("edit navigation modal closed");
      cb(null, editModal.$scope.navs);
    });
  };

  var removeFromClient = function (navs, index, nav, cb) {
    if(cb) return SortableService.remove(navs, index, nav, cb);
    else return SortableService.remove(navs, index, nav);
  };

  var remove = function(navs, index, nav, page, cb) {
    if(typeof(index) === 'undefined' || index === null) {
      index = navs.indexOf(nav);
    }
    navs = removeFromClient(navs, index, nav);
    // if nav has an id it is saved on database, if not, not
    if(nav.id) {
      $log.debug("remove from server, too" ,nav);
      $sailsSocket.delete('/navigation/'+nav.id+"?page="+page, {id:nav.id, page: page}).success(function(data, status, headers, config) {
        if(cb) cb(null, navs)
      }).
      error(function(data, status, headers, config) {
        $log.error (errors[0], data);
        if(cb) cb(data);
      });;
    }
  };

  var fix = function(fixed, object, index, cb) {
    console.log(object);
    if(typeof(object.name) !== 'undefined' && object.name && object.name !== "") {
      fixed.push(object)
    } else {
      $log.warn("Name not set, remove Subnavigation");
    }
    if(cb) cb(null, fixed);
    else return fixed;
  };

  var fixEach = function(objects, cb) {
    var fixed = [];
    for (var i = objects.length - 1; i >= 0; i--) {
      fixed = fix(fixed, objects[i], i);
    };
    if(cb) cb(null, fixed);
    else return fixed;
  };

  var save = function(navs, page, cb) {
    fixEach(navs, function(err, navs) {
      $sailsSocket.put('/navigation/replaceall', {navs: navs, page: page}).success(function(data, status, headers, config) {
        if(data != null && typeof(data) !== "undefined") {
          // WORKAROUND until socket event works
          navs = $filter('orderBy')(data, 'position');
          if(cb) cb(null, navs);
        } else {
          var err = 'Navigation konnte nicht gespeichert werden';
          $rootScope.pop('error', err, "");
          if(cb) cb(err, navs);
        }
      });
    });
  };

  var resolve = function(page) {
    var statename = 'layout.gallery';
    return $sailsSocket.get('/navigation?page='+page, {page: page}).then (function (data) {
      if(angular.isUndefined(data) || angular.isUndefined(data.data)) {
        $log.warn("Warn: On trying to resolve "+page+" navs!", "Not found, navigation is empty!");
        return null;
      }
      data.data = $filter('orderBy')(data.data, 'position');
      $log.debug(data);
      return data.data;
    }, function error (resp){
      $log.error("Error: On trying to resolve "+page+" navs!", resp);
    });
  };

  return {
    resizeOnImagesLoaded: resizeOnImagesLoaded,
    subscribe: subscribe,
    setEditModal: setEditModal,
    getEditModal: getEditModal,
    create: create,
    append: append,
    add: append,
    swap: swap,
    moveForward: moveForward,
    moveBackward: moveBackward,
    edit: edit,
    removeFromClient: removeFromClient,
    remove: remove,
    save: save,
    resolve: resolve
  };
});