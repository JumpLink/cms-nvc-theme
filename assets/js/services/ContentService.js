jumplink.cms.service('ContentService', function ($log, $sailsSocket, $filter) {

  var showHtml = false;

  var getShowHtml = function() {
    return showHtml;
  }

  var toogleHtml = function(contents, cb) {
    showHtml = !showHtml;
    if(showHtml && contents) {
      contents = beautifyEach(contents);
    }
    if(cb) cb(null, contents);
    else return contents;
  }

  var beautify = function(content, cb) {
    content.content = html_beautify(content.content);
    if(cb) cb(null, content);
    else return content;
  }

  var beautifyEach = function(contents, cb) {
    for (var i = contents.length - 1; i >= 0; i--) {
      contents[i].content = beautify(contents[i].content);
    };
    if(cb) cb(null, contents);
    else return contents;
  }

  var add = function(contents, modal, page, cb) {
    var new_index = contents.length;
    contents.push({
      position: contents[new_index-1].position+1,
      content: "",
      title: "",
      name: "",
      page: page
    });
    edit(modal, contents[new_index], cb);
  }

  var swap = function(contents, index_1, index_2, cb) {

    var content_1 = contents[index_1];
    var content_2 = contents[index_2];

    // swap position too
    var position_tmp = content_1.position;
    content_1.position = content_2.position;
    content_2.position = position_tmp;

    // IMPORTANT: swap Indexes, too
    contents[index_1] = content_2;
    contents[index_2] = content_1;

    if(cb) cb(null, contents);
    else return contents;
  }

  var moveForward = function(index, contents, cb) {
    if(index + 1 < contents.length ) {
      return swap(contents, index, index+1, cb);
    } else {
      if(cb) cb("Can't move forward, index is the last element.", contents);
      else return contents;
    }
  }

  var moveBackward = function(index, contents, cb) {
    if(index - 1 >= 0) {
      return swap(contents, index, index-1, cb);
    } else {
      if(cb) cb("Can't move backward, index is the first element.", contents);
      else return contents;
    }
  }

  var edit = function(modal, content, cb) {
    $log.debug("edit", content);
    modal.$scope.content = content;
    //- Show when some event occurs (use $promise property to ensure the template has been loaded)
    modal.$promise.then(modal.show);

    modal.$scope.$on('modal.hide',function(){
      $log.debug("edit closed");
      cb(null, modal.$scope.content);
    });
  }

  var removeFromClient = function (contents, index, content) {
    $log.debug("removeFromClient", index, content);
    if (index > -1) {
      contents.splice(index, 1);
    }
  }

  var remove = function(contents, index, content, page, cb) {
    if(typeof(index) === 'undefined' || index === null) {
      index = contents.indexOf(content);
    }
    removeFromClient(contents, index, content);
    // if content has an id it is saved on database, if not, not
    if(content.id) {
      $log.debug("remove from server, too" ,content);
      $sailsSocket.delete('/content/'+content.id+"?page="+page, {id:content.id, page: page}).success(function(data, status, headers, config) {
        if(cb) cb(null, data)
      });
    }
  }

  var refresh = function(contents, cb) {
    fixEach(contents, function(err, contents) {
      if(err) {
        $log.error(err);
        if(cb) cb(err);
        else return err;
      }
      beautifyEach(contents, function(err, contents) {
        if(err) {
          $log.error(err);
          if(cb) cb(err);
          else return err;
        } else {
          if(cb) cb(null, contents);
          else return contents;
        }
      });
    });
  }

  var fix = function(content, cb) {
    if(!content.name || content.name === "") {
      // Set content.name to content.title but only the letters in lower case
      content.name = content.title.toLowerCase().replace(/[^a-z]+/g, '');
      $log.debug("set content.name to", content.name);
    }
    if(cb) cb(null, content);
    else return content;
  }

  var fixEach = function(contents, cb) {
    for (var i = contents.length - 1; i >= 0; i--) {
      contents[i] = fix(contents[i]);
    };
    if(cb) cb(null, contents);
    else return contents;
  }

  var save = function(contents, page, cb) {
    fixEach(contents, function(err, contents) {
      if(err)
        if(cb) cb(err);
        else return err;
      $sailsSocket.put('/content/replaceall', {contents: contents, page: page}).success(function(data, status, headers, config) {
        if(data != null && typeof(data) !== "undefined") {
          contents = $filter('orderBy')(data, 'position');
          $log.debug (data);
          if(cb) cb(null, contents);
        } else {
          var err = 'Seite konnte nicht gespeichert werden';
          $log.error (err);
          if(cb) cb(err);
        }
      });
    });
  }

  return {
    getShowHtml: getShowHtml,
    toogleHtml: toogleHtml,
    beautify: beautify,
    beautifyEach: beautifyEach,
    add: add,
    swap: swap,
    moveForward: moveForward,
    moveBackward: moveBackward,
    edit: edit,
    removeFromClient: removeFromClient,
    remove: remove,
    refresh: refresh,
    fix: fix,
    fixEach: fixEach,
    save: save
  };
});