jumplink.cms.controller('TimelineController', function($rootScope, $scope, events, config,  moment, $sailsSocket, $modal, $datepicker, EventService, FileUploader, $log) {
  $scope.events = events;
  $scope.config = config;
  $scope.uploader = new FileUploader({url: 'timeline/upload', removeAfterUpload: true});
  var typeChooserModal = $modal({scope: $scope, title: 'Typ wählen', template: 'events/typechoosermodal', show: false});
  var editEventModal = $modal({scope: $scope, title: 'Ereignis bearbeiten', uploader: $scope.uploader, template: 'events/editeventmodal', show: false});
  var types = ['lecture', 'panel discussion', 'travel', 'info', 'food', 'other'];

  $scope.uploader.onCompleteItem = function(fileItem, response, status, headers) {
    fileItem.event.download = response.files[0].uploadedAs;
  };

  $scope.uploader.onProgressItem = function(fileItem, progress) {
    console.info('onProgressItem', fileItem, progress);
  };

  $scope.upload = function(fileItem, event) {
    fileItem.event = event;
    fileItem.upload();
  };

  var saveEvent = function (event, eventName) {
    if(angular.isUndefined(event.id)) {
      $sailsSocket.post('/timeline', event).success(function(data, status, headers, config) {
        $log.debug("event created", event, data);
        var index = $scope.events[eventName].indexOf(event);
        if (index > -1) {
          $scope.events[eventName][index] = data;
          $log.debug($scope.events[eventName][index]);
        }
      });
    } else {
      $sailsSocket.put('/timeline/'+event.id, event).success(function(data, status, headers, config) {
        $log.debug("event updated", event, data);
        event = data;
      });
    }
  };

  $scope.save = function(event, eventName) {
    if($rootScope.authenticated) {
      // save just this event if defined
      if(angular.isDefined(event)) {
        saveEvent(event, eventName);
      } else { // save all events
        angular.forEach(['after', 'before', 'unknown'], function(eventPart, index) {
          angular.forEach($scope.events[eventPart], function(event, index) {
            saveEvent(event, eventName);
          });
        });
      }
    }
  };

  $scope.add = function() {
    if($rootScope.authenticated) {
      if($scope.events.after.length > 0) {
        var newEvent = angular.copy($scope.events.after[0]);
        newEvent.from = moment();
        newEvent.from.add(1, 'hours');
        newEvent.from.minutes(0);
        delete newEvent.to;
        delete newEvent.id;
        $scope.events.after.push(newEvent);
        $scope.edit(newEvent);
      } else {
        $log.debug("Es gibt keine anstehenden Veranstaltungen zum duplizieren: ");
        $log.debug($scope.events.after);
      }
    }
  };

  var removeFromClient = function (event, eventName) {
    $log.debug("removeFromClient", event, eventName);
    var index = $scope.events[eventName].indexOf(event);
    if (index > -1) {
      $scope.events[eventName].splice(index, 1);
    } else {
      $log.debug("not found");
    }
  };

  // TODO use async "not found"-callback is fired after value was found
  var findEvent = function(id, callback) {
    $log.debug("findEvent", id);
    angular.forEach(['after', 'before', 'unknown'], function(eventPart, index) {
      if(eventPart === 'unknown' && $scope.events[eventPart].length <= 0) {
        return callback("not found");
      }
      angular.forEach($scope.events[eventPart], function(event, index) {
        $log.debug("event.id", event.id);
        if(event.id == id) {
          return callback(null, event, eventPart, index);
        }
        if(eventPart === 'unknown' && index === $scope.events[eventPart].length - 1 &&  event.id != id) {
          return callback("not found");
        }
      });
    });
  };

  $scope.remove = function(event, eventName) {
    $log.debug("$scope.remove", event, eventName);
    if($rootScope.authenticated) {
      if(eventName == "after" && $scope.events["after"].length <= 1) {
        $log.debug("Das letzte noch anstehende Ereignis kann nicht gelöscht werden.");
      } else {
        if(event.id) {
          $log.debug(event);
          $sailsSocket.delete('/timeline/'+event.id).success(function(users, status, headers, config) {
            removeFromClient(event, eventName);
          });
        } else {
          removeFromClient(event, eventName);
        }
      }
    }
  };

  $scope.refresh = function() {
    var allEvents = EventService.merge(events.unknown, events.before, events.after);

    $log.debug("allEvents.length", allEvents.length);
    $scope.events = EventService.transform(allEvents);
    $log.debug("refreshed");
  };

  $scope.edit = function(event, eventName) {
    if($rootScope.authenticated) {
      editEventModal.$scope.event = event;
      editEventModal.$scope.eventName = eventName;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      editEventModal.$promise.then(editEventModal.show);
    }
  };

  $scope.openTypeChooserModal = function(event) {
    if($rootScope.authenticated) {
      typeChooserModal.$scope.event = event;
      //- Show when some event occurs (use $promise property to ensure the template has been loaded)
      typeChooserModal.$promise.then(typeChooserModal.show);
    }
  };

  $scope.chooseType = function(event, type, hide) {
    event.type = type;
    hide();
  };

  $sailsSocket.subscribe('timeline', function(msg){
    $log.debug(msg);

    switch(msg.verb) {
      case 'updated':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde aktualisiert', msg.data.title);
        }
        findEvent(msg.id, function(error, event, eventPart, index) {
          if(error) $log.debug(error);
          else event = msg.data;
          $scope.refresh();
        });
      break;
      case 'created':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde erstellt', msg.data.title);
        }
        $scope.events['before'].push(msg.data);
        $scope.refresh();
      break;
      case 'removedFrom':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde entfernt', msg.data.title);
        }
        findEvent(msg.id, function(error, event, eventPart, index) {
          if(error) $log.debug(error);
          else removeFromClient(event, eventPart);
        });
      break;
      case 'destroyed':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde gelöscht', msg.data.title);
        }
        findEvent(msg.id, function(error, event, eventPart, index) {
          if(error) $log.debug(error);
          else removeFromClient(event, eventPart);
        });
      break;
      case 'addedTo':
        if($rootScope.authenticated) {
          $rootScope.pop('success', 'Ein Ereignis wurde hinzugefügt', msg.data.title);
        }
      break;
    }
  });

});