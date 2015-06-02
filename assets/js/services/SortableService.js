jumplink.cms.service('SortableService', function ($rootScope, $window, $log, $sailsSocket, $filter, $modal) {

  var swap = function(objects, index_1, index_2, cb) {

    var object_1 = objects[index_1];
    var object_2 = objects[index_2];

    // swap position too
    var position_tmp = object_1.position;
    object_1.position = object_2.position;
    object_2.position = position_tmp;

    // IMPORTANT: swap Indexes, too
    objects[index_1] = object_2;
    objects[index_2] = object_1;

    if(cb) cb(null, objects);
    else return objects;
  }

  var moveForward = function(index, objects, cb) {
    if(index + 1 < objects.length ) {
      return swap(objects, index, index+1, cb);
    } else {
      if(cb) cb("Can't move forward, index is the last element.", objects);
      else return objects;
    }
  }

  var moveBackward = function(index, objects, cb) {
    if(index - 1 >= 0) {
      return swap(objects, index, index-1, cb);
    } else {
      if(cb) cb("Can't move backward, index is the first element.", objects);
      else return objects;
    }
  }

  var remove = function (objects, index, object, cb) {
    $log.debug("remove from client", index, object);
    if (index > -1) {
      objects.splice(index, 1);
    }
    if(cb) cb(null, objects);
    else return objects;
  }

  var add = function(objects, data, cb) {
    var new_index = objects.length;
    var new_position = 0;
    var new_object;

    if(new_index >= 1) {
      new_position = objects[new_index-1].position+1
    }

    new_object = {
      position: new_position,
    }
    angular.extend(new_object, data);
    $log.debug("new_object", new_object);
    // $log.debug("old objects", objects);
    objects.push(new_object);
    // $log.debug("new objects", objects);

    if(cb) cb(null, objects, new_index);
    else return objects;
  }

  // var onDragComplete = function(index, object, event, onClick) {
  //   if(object == null) {
  //     $log.debug("*click*", index);
  //     if(onClick) onClick();
  //   }
  //   $log.debug("onDragComplete, object:", object, "index", index);
  // }

  var onDropComplete = function(objects, dropObjectIndex, dragObject, event, cb) {
    var dragObjectIndex = objects.indexOf(dragObject);
    var dropObject = objects[dropObjectIndex];
    $log.debug("onDropComplete, dragObject:", dragObject, "dragObjectIndex", dragObjectIndex, "dropObject", dropObject, "dropObjectIndex", dropObjectIndex);
    return swap(objects, dragObjectIndex, dropObjectIndex, cb);
    
   
  }

  // var onDropOnAreaComplete = function(objects, object, event) {
  //   var index = objects.indexOf(image);
  //   $log.debug("onDropOnAreaComplete, object:", object, "index", index);
  // }

  return {
    swap: swap,
    moveForward: moveForward,
    moveBackward: moveBackward,
    remove: remove,
    add: add,
    // onDragComplete: onDragComplete,
    onDropComplete: onDropComplete,
    // onDropOnAreaComplete: onDropOnAreaComplete
  };
});