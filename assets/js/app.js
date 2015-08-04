if (typeof jumplink === 'undefined') {
  var jumplink = {};
}


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
  , 'ngAsync'
  , 'ngFocus'
  , 'ngHistory'
  , 'jumplink.cms.content'
  , 'jumplink.cms.sortable'
  , 'jumplink.cms.utilities'
  , 'jumplink.cms.subnavigation'
  , 'jumplink.cms.info'
  , 'jumplink.cms.config'
  , 'jumplink.cms.event'
  , 'jumplink.cms.user'
  , 'jumplink.cms.theme'
  , 'jumplink.cms.gallery'
  , 'jumplink.cms.admin'
]);

jumplink.cms.config( function($stateProvider, $urlRouterProvider, $locationProvider, $provide, $logProvider) {

  // see init.jade environment variable
  $logProvider.debugEnabled(environment === 'development');

  // use the HTML5 History API
  $locationProvider.html5Mode(false);

  $urlRouterProvider.otherwise('/home');

  $stateProvider
  // LAYOUT
  .state('layout', {
    abstract: true
    , templateUrl: '/views/modern/layout.jade'
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
        templateUrl: '/views/modern/home/content.jade'
        , controller: 'HomeContentController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  })
  // gallery
  .state('layout.gallery', {
    url: '/gallery'
    , resolve:{
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
        templateUrl: '/views/modern/gallery/content.jade'
        , controller: 'GalleryContentController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  })
  .state('layout.gallery-fullscreen', {
    url: '/gallery/fs/:id'
    , resolve:{
      image: function($sailsSocket, $stateParams, $log) {
        // $log.debug("$stateParams", $stateParams);
        return $sailsSocket.get('/gallery/'+$stateParams.id).then (function (data) {
          // $log.debug('/gallery/'+$stateParams.id, data);
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
        templateUrl: '/views/modern/gallery/fullscreen.jade'
        , controller: 'GalleryFullscreenController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      // , 'footer' : {
      //   templateUrl: '/views/modern/footer.jade'
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
        templateUrl: '/views/modern/gallery/slider.jade'
        , controller: 'GallerySlideController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/gallery/toolbar.jade'
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
        templateUrl: '/views/modern/events/timeline.jade'
        , controller: 'TimelineController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
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
        templateUrl: '/views/modern/members/content.jade'
        , controller: 'MembersController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
      // 'adminbar': {
      //   templateUrl: '/views/modern/adminbar.jade'
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
        templateUrl: '/views/modern/application/content.jade'
        , controller: 'ApplicationController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
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
        templateUrl: '/views/modern/imprint/content.jade'
        , controller: 'ImprintController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
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
        templateUrl: '/views/modern/links/content.jade'
        , controller: 'LinksController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
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
          // $log.log(data);
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      }
    }
    , views: {
      'content' : {
        templateUrl: '/views/modern/administration/settings.jade'
        , controller: 'AdminController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
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
        templateUrl: '/views/modern/administration/users.jade'
        , controller: 'UsersController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
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
        templateUrl: '/views/modern/administration/user.jade'
        , controller: 'UserController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
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
        templateUrl: '/views/modern/administration/user.jade'
        , controller: 'UserController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
    }
  })
  // cms
  .state('layout.cms', {
    url: '/cms'
    , resolve:{
      info: function(CmsService, $log) {
        $log.debug("start get cms info");
        return CmsService.infoUser();
      },
    }
    , views: {
      'content' : {
        templateUrl: '/views/modern/cms/content.jade'
        , controller: 'CmsController'
      }
      , 'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade'
        , controller: 'ToolbarController'
      }
      , 'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  })
  ;
});
