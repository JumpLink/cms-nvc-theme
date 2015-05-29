jumplink.cms.service('EventService', function (moment, UtilityService, $sailsSocket, $async, $log) {

  var split = function(events) {
    var unknown = [], before = [], after = [];
    for (var i = 0; i < events.length; i++) {

      if(angular.isDefined(events[i].to)) {
        events[i].to = moment(events[i].to);
      }

      if(angular.isDefined(events[i].from)) {
        events[i].from = moment(events[i].from);
        if(events[i].from.isAfter())
          after.push(events[i]);
        else
          before.push(events[i]);
      } else {
        unknown.push(events[i]);
      }
    };
    return {unknown:unknown, before:before, after:after};
  }

  var transform = function(events) {
    events = split(events);
    events.before = UtilityService.invertOrder(events.before);
    return events;
  }

  var merge = function(unknown, before, after) {
    if(angular.isUndefined(unknown))
      unknown = [];
    if(angular.isUndefined(before))
      before = [];
    if(angular.isUndefined(after))
      after = [];
    return unknown.concat(before).concat(after);
  }

  var fix = function(object, cb) {
    if(!object.name || object.name === "") {
      // Set object.name to object.title but only the letters in lower case
      object.name = object.title.toLowerCase().replace(/[^a-z]+/g, '');
      $log.debug("set object.name to", object.name);
    }
    if(cb) cb(null, object);
    else return object;
  }

  var fixEach = function(objects, cb) {
    for (var i = objects.length - 1; i >= 0; i--) {
      objects[i] = fix(objects[i]);
    };
    if(cb) cb(null, objects);
    else return objects;
  }

  var refresh = function() {
    var allEvents = merge(events.unknown, events.before, events.after);
    $log.debug("allEvents.length", allEvents.length);
    $scope.events = EventService.transform(allEvents);
    $log.debug("refreshed");
  };

  var save = function (event, eventName, cb) {
    var errors = [
      "EventService: Can't save event.",
      "EventService: Can't save event, event to update not found.",
      "EventService: Can't save event, parameters undefind.",
    ]
    if(angular.isDefined(event) && angular.isDefined(eventName) && angular.isDefined(cb)) {
      event = fix(event);
      if(angular.isUndefined(event.id)) {
        $sailsSocket.post('/timeline', event).success(function(data, status, headers, config) {
          if(angular.isArray(data)) data = data[0];
          $log.debug("event created", event, data);
          var index = $scope.events[eventName].indexOf(event);
          if (index > -1) {
            $scope.events[eventName][index] = data;
            $log.debug($scope.events[eventName][index]);
            cb(null, $scope.events[eventName][index]);
          } else {
            cb(errors[1]);
          }
        }).error(function (data, status, headers, config) {
          if(angular.isArray(data)) data = data[0];
          $log.error(data, status, headers, config);
          cb(errors[0]);
        });
      } else {
        $sailsSocket.put('/timeline/'+event.id, event).success(function(data, status, headers, config) {
          if(angular.isArray(data)) data = data[0];
          $log.debug("event updated", event, data);
          event = data;
          cb(null, event);
        }).error(function (data, status, headers, config) {
          $log.error(data, status, headers, config);
          cb(errors[0]);
        });
      }
    } else {
      cb(errors[2]);
    }
  };

  var saveAll = function(events, cb) {
    var errors = [
      "EventService: Can't save event(s), parameters undefind."
    ]
    // save just this event if defined
    if(angular.isDefined(events) && angular.isDefined(cb)) {

      $async.map(['after', 'before', 'unknown'], function (eventPart, cb) {
        $async.map(events[eventPart], function (event, cb) {
          save(event, eventPart, cb);
        }, cb);
      }, function(err, events) {
        if(err) cb(err);
        else {
          var allEvents = merge(events[0], events[1], events[2]);
          events = transform(allEvents);
          cb(null, events);
        }
      });
    } else {
      if(cb) cb(errors[0]);
      else $log.error(errors[0]);
    }
  };

  var resolve = function(page) {
    return $sailsSocket.get('/timeline').then (function (data) {
      // $log.debug(data);
      return transform(data.data);
    }, function error (resp){
      $log.error("Error on resolve "+page, resp);
    });
  };

  return {
    split: split,
    merge: merge,
    transform: transform,
    save: save,
    saveAll: saveAll,
    fixEach: fixEach,
    resolve: resolve
  };
});