// window.saveAs
// Shims the saveAs method, using saveBlob in IE10.
// And for when Chrome and FireFox get round to implementing saveAs we have their vendor prefixes ready.
// But otherwise this creates a object URL resource and opens it on an anchor tag which contains the "download" attribute (Chrome)
// ... or opens it in a new tab (FireFox)
// @author Andrew Dodson
// @copyright MIT, BSD. Free to clone, modify and distribute for commercial and personal use.
// https://gist.github.com/MrSwitch/3552985

window.saveAs || ( window.saveAs = (window.navigator.msSaveBlob ? function(b,n){ return window.navigator.msSaveBlob(b,n); } : false) || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs || (function(){
  // URL's
  window.URL || (window.URL = window.webkitURL);
  if(!window.URL){
    return false;
  }
  return function(blob,name){
    var url = URL.createObjectURL(blob);
    // Test for download link support
    if( "download" in document.createElement('a') ){
      var a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', name);
      // Create Click event
      var clickEvent = document.createEvent ("MouseEvent");
      clickEvent.initMouseEvent ("click", true, true, window, 0,
        event.screenX, event.screenY, event.clientX, event.clientY,
        event.ctrlKey, event.altKey, event.shiftKey, event.metaKey,
        0, null);
      // dispatch click event to simulate download
      a.dispatchEvent (clickEvent);
    }
    else{
      // fallover, open resource in new tab.
      window.open(url, '_blank', '');
    }
  };
})());

if (typeof jumplink === 'undefined') {
  var jumplink = {};
}

// Sourde: https://github.com/darius/requestAnimationFrame
// Adapted from https://gist.github.com/paulirish/1579671 which derived from
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller.
// Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

// MIT license

if (!Date.now)
    Date.now = function() { return new Date().getTime(); };

(function() {
    'use strict';

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                   || window[vp+'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function(callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function() { callback(lastTime = nextTime); },
                              nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());

jumplink.cms = angular.module('jumplink.cms', [
  'ui.router'                 // AngularUI Router: https://github.com/angular-ui/ui-router
  , 'ngAnimate'               // ngAnimate: https://docs.angularjs.org/api/ngAnimate
  , 'ngSanitize'              // ngSanitize: https://docs.angularjs.org/api/ngSanitize
  , 'sails.io'                // angularSails: https://github.com/balderdashy/angularSails
  , 'webodf'                  // custom module
  , 'FBAngular'               // angular-fullscreen: https://github.com/fabiobiondi/angular-fullscreen
  , 'mgcrea.ngStrap'          // AngularJS 1.2+ native directives for Bootstrap 3: http://mgcrea.github.io/angular-strap/
  , 'angularMoment'           // Angular.JS directive and filters for Moment.JS: https://github.com/urish/angular-moment
  // , 'wu.masonry'              // A directive to use masonry with AngularJS: http://passy.github.io/angular-masonry/
  , 'angular-carousel'        // An AngularJS carousel implementation optimised for mobile devices: https://github.com/revolunet/angular-carousel
  // , 'textAngular'             // A radically powerful Text-Editor/Wysiwyg editor for Angular.js: https://github.com/fraywing/textAngular
  , 'angular-medium-editor'   // AngularJS directive for Medium.com editor clone: https://github.com/thijsw/angular-medium-editor
  , 'ui.ace'                  // This directive allows you to add ACE editor elements: https://github.com/angular-ui/ui-ace
  , 'leaflet-directive'       // AngularJS directive to embed an interact with maps managed by Leaflet library: https://github.com/tombatossals/angular-leaflet-directive
  , 'toaster'                 // AngularJS Toaster is a customized version of "toastr" non-blocking notification javascript library: https://github.com/jirikavi/AngularJS-Toaster
  , 'angularFileUpload'       // Angular File Upload is a module for the AngularJS framework: https://github.com/nervgh/angular-file-upload
  , 'angular-filters'         // Useful filters for AngularJS: https://github.com/niemyjski/angular-filters
  , 'ngDraggable'             // Drag and drop module for Angular JS: https://github.com/fatlinesofcode/ngDraggable
  , 'toggle-switch'           // AngularJS Toggle Switch: https://github.com/JumpLink/angular-toggle-switch
]);

jumplink.cms.config( function($stateProvider, $urlRouterProvider, $locationProvider) {

  // use the HTML5 History API
  $locationProvider.html5Mode(false);

  $urlRouterProvider.otherwise('/home');

  $stateProvider
  // LAYOUT
  .state('layout', {
    abstract: true
    , templateUrl: "layout"
    , controller: 'LayoutController'
  })
  // HOME
  .state('layout.home', {
    url: '/home'
    , resolve:{
      navs: function(SubnavigationService) {
        var statename = 'layout.home';
        return SubnavigationService.resolve(statename);
      },
      contents: function(ContentService) {
        var statename = 'layout.home';
        return ContentService.resolveAll(statename, 'dynamic');
      },
      news: function(ContentService) {
        var statename = 'layout.home';
        return ContentService.resolveOne(statename, 'news', 'fix');
      },
      events: function(EventService) {
        var statename = 'layout.home';
        return EventService.resolve(statename);
      }
    }
    , views: {
      'content' : {
        templateUrl: 'home/content'
        , controller: 'HomeContentController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // gallery
  .state('layout.gallery', {
    url: '/gallery'
    , resolve:{
      // images: function(GalleryService) {
      //   var statename = 'layout.gallery';
      //   return GalleryService.resolve(statename, 'test');
      // },
      navs: function(SubnavigationService) {
        var statename = 'layout.gallery';
        return SubnavigationService.resolve(statename);
      },
      contents_images: function(ContentService) {
        var statename = 'layout.gallery';
        return ContentService.resolveAllWithImage(statename);
      },
      config: function(ConfigService) {
        var statename = 'layout.gallery';
        return ConfigService.resolve(statename);
      }
    }
    , views: {
      'content' : {
        templateUrl: 'gallery/content'
        , controller: 'GalleryContentController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  .state('layout.gallery-fullscreen', {
    url: '/gallery/fs/:id'
    , resolve:{
      image: function($sailsSocket, $stateParams, $log) {
        $log.debug("$stateParams", $stateParams);
        return $sailsSocket.get('/gallery/'+$stateParams.id).then (function (data) {
          $log.debug('/gallery/'+$stateParams.id, data);
          return data.data;
        });
      },
      config: function(ConfigService) {
        var statename = 'layout.gallery-fullscreen';
        return ConfigService.resolve(statename);
      }
    }
    , views: {
      'content' : {
        templateUrl: 'gallery/fullscreen'
        , controller: 'GalleryFullscreenController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      // , 'footer' : {
      //   templateUrl: 'footer'
      //   , controller: 'FooterController'
      // }
    }
  })
  // gallery slideshow
  .state('layout.gallery-slider', {
    url: '/slider/:slideIndex'
    , resolve:{
      images: function($sailsSocket, $log) {
        return $sailsSocket.get('/gallery?limit=0').then (function (data) {
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'gallery/slider'
        , controller: 'GallerySlideController'
      }
      , 'toolbar' : {
        templateUrl: 'gallery/toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  // events timeline
  .state('layout.timeline', {
    url: '/events'
    , resolve:{
      events: function(EventService) {
        var statename = 'layout.timeline';
        return EventService.resolve(statename);
      },
      config: function(ConfigService) {
        var statename = 'layout.timeline';
        return ConfigService.resolve(statename);
      }
    }
    , views: {
      'content' : {
        templateUrl: 'events/timeline'
        , controller: 'TimelineController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // members
  .state('layout.members', {
    url: '/members'
    , resolve:{
      members: function($sailsSocket, $filter, $log) {
        return $sailsSocket.get('/member').then (function (data) {
          return $filter('orderBy')(data.data, 'position');
        }, function error (resp){
          $log.error(resp);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'members/content'
        , controller: 'MembersController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
      // 'adminbar': {
      //   templateUrl: 'adminbar'
      // }
    }
  })
  // application
  .state('layout.application', {
    url: '/application'
    , resolve:{
      application: function(ContentService) {
        var statename = 'layout.application';
        var name = 'application';
        return ContentService.resolveOne(statename, name);
      },
      config: function(ConfigService) {
        var statename = 'layout.application';
        return ConfigService.resolve(statename);
      }
    }
    , views: {
      'content' : {
        templateUrl: 'application/content'
        , controller: 'ApplicationController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // imprint
  .state('layout.imprint', {
    url: '/imprint'
    , resolve: {
      navs: function(SubnavigationService) {
        var statename = 'layout.imprint';
        return SubnavigationService.resolve(statename);
      },
      imprint: function(ContentService) {
        var statename = 'layout.imprint';
        var name = 'imprint';
        return ContentService.resolveOne(statename, name);
      },
      config: function(ConfigService) {
        var statename = 'layout.imprint';
        return ConfigService.resolve(statename);
      }
    }
    , views: {
      'content' : {
        templateUrl: 'imprint/content'
        , controller: 'ImprintController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // links
  .state('layout.links', {
    url: '/links'
    , resolve:{
      links: function(ContentService) {
        var statename = 'layout.links';
        var name = 'links';
        return ContentService.resolveOne(statename, name);
      },
    }
    , views: {
      'content' : {
        templateUrl: 'links/content'
        , controller: 'LinksController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: 'footer'
        , controller: 'FooterController'
      }
    }
  })
  // administration
  .state('layout.administration', {
    url: '/admin'
    , resolve:{
      themeSettings: function($sailsSocket, $log) {
        return $sailsSocket.get('/theme/find').then (function (data) {
          $log.log(data);
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/settings'
        , controller: 'AdminController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('layout.users', {
    url: '/users'
    , resolve:{
      users: function($sailsSocket, $log) {
        return $sailsSocket.get('/user').then (function (data) {
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/users'
        , controller: 'UsersController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('layout.user', {
    url: '/user/:index'
    , resolve:{
      user: function($sailsSocket, $stateParams, $log) {
        return $sailsSocket.get('/user'+'/'+$stateParams.index).then (function (data) {
          delete data.data.password;
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/user'
        , controller: 'UserController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  .state('layout.new-user', {
    url: '/new/user'
    , resolve:{
      user: function() {
        return {

        };
      }
    }
    , views: {
      'content' : {
        templateUrl: 'administration/user'
        , controller: 'UserController'
      }
      , 'toolbar' : {
        templateUrl: 'toolbar'
        , controller: 'ToolbarController'
      }
    }
  })
  ;
});
