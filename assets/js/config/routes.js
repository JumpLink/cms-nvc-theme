jumplink.cms.config( function($stateProvider, $urlRouterProvider, $locationProvider) {

  var routeOptions = {};

  // use the HTML5 History API
  $locationProvider.html5Mode(true);

  $stateProvider.state('layout', {
    abstract: true,
    templateUrl: '/views/modern/layout.jade',
    controller: 'LayoutController'
  });

  // HOME
  routeOptions.layoutHome = {
    resolve: {
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
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/home/content.jade'
        , controller: 'HomeContentController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // members
  routeOptions.layoutMembers = {
    resolve: {
      members: function($sailsSocket, $filter, $log) {
        return $sailsSocket.get('/member').then (function (data) {
          return $filter('orderBy')(data.data, 'position');
        }, function error (resp){
          $log.error(resp);
        });
      }
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/members/content.jade'
        , controller: 'MembersController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // events timeline
  routeOptions.layoutEvents = {
    resolve: {
      events: function(EventService) {
        var statename = 'layout.timeline';
        return EventService.resolve(statename);
      },
      config: function(ConfigService) {
        var statename = 'layout.timeline';
        return ConfigService.resolve(statename);
      }
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/events/timeline.jade'
        , controller: 'TimelineController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // gallery
  routeOptions.layoutGallery = {
    resolve: {
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
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/gallery/content.jade'
        , controller: 'GalleryContentController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // application
  routeOptions.layoutApplication = {
    resolve: {
      application: function(ContentService) {
        var statename = 'layout.application';
        var name = 'application';
        return ContentService.resolveOne(statename, name);
      },
      config: function(ConfigService) {
        var statename = 'layout.application';
        return ConfigService.resolve(statename);
      }
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/application/content.jade'
        , controller: 'ApplicationController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // links
  routeOptions.layoutLinks = {
    resolve: {
      links: function(ContentService) {
        var statename = 'layout.links';
        var name = 'links';
        return ContentService.resolveOne(statename, name);
      },
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/links/content.jade'
        , controller: 'LinksController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // imprint
  routeOptions.layoutImprint = {
    resolve: {
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
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/imprint/content.jade'
        , controller: 'ImprintController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade'
        , controller: 'FooterController'
      }
    }
  };

  // administration
  $stateProvider.state('layout.admin', {
    resolve: {
      themeSettings: function($sailsSocket, $log) {
        return $sailsSocket.get('/theme/find').then (function (data) {
          // $log.log(data);
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      }
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/administration/settings.jade'
        , controller: 'AdminController'
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      },
    }
  });

  // USERS
  $stateProvider.state('layout.users', {
    url: '/users',
    resolve:{
      users: function($sailsSocket, $log) {
        return $sailsSocket.get('/user').then (function (data) {
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      },
      routes: function(RoutesService) {
        return RoutesService.find({});
      },
      authenticated: function (SessionService) {
        return SessionService.isAuthenticated();
      },
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/administration/users.jade',
        controller: 'UsersController'
      },
      'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade',
        controller: 'ToolbarController'
      }
    }
  });

  // layout.gallery-fullscreen
  $stateProvider.state('layout.gallery-fullscreen', {
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
      },
      'toolbar' : {
        resolve: {
          routes: function(RoutesService) {
            return RoutesService.find({});
          },
        },
        template: '<jl-toolbar routes="routes", title="title", shorttitle="shorttitle", position="position", fluid="fluid", name="name"></jl-toolbar>',
        controller: 'ToolbarController'
      }
    }
  });

  // USER
  $stateProvider.state('layout.user', {
    url: '/user/:index',
    resolve: {
      user: function($sailsSocket, $stateParams, $log) {
        return $sailsSocket.get('/user'+'/'+$stateParams.index).then (function (data) {
          delete data.data.password;
          return data.data;
        }, function error (resp){
          $log.error(resp);
        });
      },
      routes: function(RoutesService) {
        return RoutesService.find({});
      },
      authenticated: function (SessionService) {
        return SessionService.isAuthenticated();
      },
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/administration/user.jade',
        controller: 'UserController'
      },
      'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade',
        controller: 'ToolbarController'
      }
    }
  });

  // NEW USER
  $stateProvider.state('layout.new-user', {
    url: '/new/user',
    resolve:{
      user: function() {
        return {

        };
      },
      routes: function(RoutesService) {
        return RoutesService.find({});
      },
      authenticated: function (SessionService) {
        return SessionService.isAuthenticated();
      },
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/administration/user.jade',
        controller: 'UserController'
      },
      'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade',
        controller: 'ToolbarController'
      }
    }
  });

  // CMS
  $stateProvider.state('layout.cms', {
    url: '/cms',
    resolve: {
      info: function(CmsService, $log) {
        $log.debug("start get cms info");
        return CmsService.infoUser();
      },
      routes: function(RoutesService) {
        return RoutesService.find({});
      },
      authenticated: function (SessionService) {
        return SessionService.isAuthenticated();
      },
    },
    views: {
      'content' : {
        templateUrl: '/views/modern/cms/content.jade',
        controller: 'CmsController'
      },
      'toolbar' : {
        templateUrl: '/views/modern/toolbar.jade',
        controller: 'ToolbarController'
      },
      'footer' : {
        templateUrl: '/views/modern/footer.jade',
        controller: 'ToolbarController'
      }
    }
  });

  /**
   * Load optional addional states.
   * WARNING: Very experimental and dangerous.
   */

  for (var i = 0; i < routes.length; i++) {
    if(routes[i].main) {
      var options = {};
      // set state main url
      if(typeof(routes[i].url) === 'string' && routes[i].url.length > 0) {
        options.url = routes[i].url;
      }
      // WARNING custom states are very experimental
      if(routes[i].customstate === true) {
        // TODO Dirty hack!
        if(angular.isDefined(routes[i].state.resolve) && typeof(routes[i].state.resolve) === 'string' && routes[i].state.resolve.length > 0) {
          eval(routes[i].state.resolve);
          options.resolve = resolve;
        }
        // TODO Dirty hack!
        if(angular.isDefined(routes[i].state.views) && typeof(routes[i].state.views) === 'string' && routes[i].state.views.length > 0) {
          eval(routes[i].state.views);
          options.views = view;
        }
      // states wich are defined in routeOptions
      } else {
        // set state options
        if(angular.isDefined(routes[i].objectName) && angular.isDefined(routeOptions[routes[i].objectName])) {
          // console.log(routeOptions[routes[i].objectName]);
          options.resolve = routeOptions[routes[i].objectName].resolve;
          options.views = routeOptions[routes[i].objectName].views;
        }
      }
      // If options are set, init state
      if(angular.isDefined(options.url) && angular.isDefined(options.resolve) && angular.isDefined(options.views)) {
        // console.log("New Route", routes[i].state.name, options);
        $stateProvider.state(routes[i].state.name, options);
      }
      //set alternative urls as redirects
      if(angular.isArray(routes[i].alternativeUrls)) {
        for (var a = 0; a < routes[i].alternativeUrls.length; a++) {
          // e.g. $urlRouterProvider.when('/referenzen', '/referenzen/uebersicht');
          // console.log("New redirect: "+routes[i].alternativeUrls[a]+" -> "+routes[i].url);
          $urlRouterProvider.when(routes[i].alternativeUrls[a], routes[i].url);
        }
      }
    } // end main
  }
});

jumplink.cms.run(function ($rootScope, $state, $window, $log) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
    $state.go('error.anmelden', {error: error});
  });
});