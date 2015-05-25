// Aufnahmeantrag
jumplink.cms.controller('ApplicationController', function($rootScope, $scope, $sailsSocket, moment, $filter, application, $state, $log) {
  var page = $state.current.name;
  var date = moment(); // now
  $scope.html = false;
  $scope.application = application;

  $scope.member = {
    datum: $filter('amDateFormat')(date, 'dddd, Do MMMM YYYY')
    , name: null
    , vorname: null
    , geburtstag: null
    , geburtsort: null
    , email: null
    , telefon: null
    , beruf: null
    , strasse: null
    , plz: null
    , ort: null
    , bank: {
      name: null
      , iban: null
      , bic: null
    }
  }
  $scope.minYearsOld = 10;
  $scope.minBirthdayDate = moment().subtract($scope.minYearsOld, 'years');
  // $log.debug("$scope.minBirthdayDate", $scope.minBirthdayDate);
  $scope.maxYearsOld = 100;
  $scope.maxBirthdayDate = moment().subtract($scope.maxYearsOld, 'years');
  // $log.debug("$scope.maxBirthdayDate)", $scope.maxBirthdayDate);

  $scope.upload = function() {
    $rootScope.pop('info', 'Aufnahmeantrag wird bearbeitet');
    $scope.webodf.refresh(function() {
      $scope.webodf.upload(function(error, response ) {
        if(error) $log.debug(error);
        $log.debug(response);
        var odtFilename = response.files[0].uploadedAs;
        var odtPath = response.files[0].fd;
        $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'pdf'}).success(function(data, status, headers, config){
          $log.debug(data);
           var pdfPath = data.target;
          $sailsSocket.put("/document/convert/", {filename: odtFilename, extension: 'html'}).success(function(data, status, headers, config){
            // $log.debug(data);
            $rootScope.pop('success', 'Aufnahmeantrag erfolgreich erzeugt');
             var htmlPath = data.target;
            // callback(null, resInfo, data, status, headers, config);
            var attachmentFilename = 'aufnahmeantrag_'+$scope.member.vorname+'_'+$scope.member.name;
            attachmentFilename = attachmentFilename.toLowerCase();

            var to = $scope.member.email+',nvcux@t-online.de';
            var subject = 'Aufnahmeantrag von '+$scope.member.vorname+' '+$scope.member.name;
            var from = $scope.member.email;

            var html = ''
            +'<dl>'
              +'<dt>Absender</dt>'
              +'<dd><a href="mailto:'+from+'">'+from+'</a></dd>'
              +'<dt>Betreff</dt>'
              +'<dd>'+subject+'</dd>'
            +'</dl>'
            +'<br>'
            +'Bitte drucken Sie den Aufnahmeantrag aus und schicken Sie ihn an den Nautischen Verein Cuxhaven e.V.';

            var text = String(html).replace(/<[^>]+>/gm, '');

            $sailsSocket.post('/email/send', {from: from, to: to, subject: subject, text: text, html: html, attachments: [{filename: attachmentFilename+".pdf", path:pdfPath}, {filename: attachmentFilename+".html", path:htmlPath}, {filename: attachmentFilename+".odt", path:odtPath}]}).success(function(data, status, headers, config){
              if(!$rootScope.authenticated) {
                $rootScope.pop('success', 'E-Mail wurde versendet.');
              }
            });
          });
        });
      });
    });
  }

  $scope.download = function() {
    $scope.webodf.refresh(function() {
      $scope.webodf.download("Aufnahmeantrag.odt");
    });
  }

  $scope.refresh = function() {
    $scope.webodf.refresh(function() {
      $rootScope.pop('success', 'Aufnahmeantrag wurde aktualisiert');
    });
  }

  var onWebODFReady = function() {
    // $log.debug("ready");
  }

  $scope.webodf = {
    ready: onWebODFReady
  };

  // called on content changes
  $sailsSocket.subscribe('content', function(msg){
    $log.debug(msg);
    switch(msg.verb) {
      case 'updated':
        switch(msg.id) {
          case 'application':
            $scope.application = msg.data;
            if($rootScope.authenticated) {
              $rootScope.pop('success', 'Aufnahmeantrags-Text wurde aktualisiert', "");
            }
          break;
        }
      break;
    }
  });

  $scope.toogleHtml = function() {
    $scope.html = !$scope.html;
  }

  $scope.save = function() {
    $scope.application.page = page;
    $sailsSocket.put("/content/replace", $scope.application, function (response) {
      if(response != null && typeof(response) !== "undefined") {
        $log.debug (response);
      } else {
        $log.debug ("Can't save site");
      }
    });
  }

});