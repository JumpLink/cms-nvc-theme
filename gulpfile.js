var gulp = require('gulp');                         // https://github.com/gulpjs/gulp
var jade = require('gulp-jade');                    // https://github.com/phated/gulp-jade
var concat = require('gulp-concat');                // https://github.com/contra/gulp-concat
var less = require('gulp-less');                    // https://github.com/plus3network/gulp-less
var jshint = require ('gulp-jshint');               // https://github.com/spalger/gulp-jshint
var uglify = require ('gulp-uglify');                           // https://github.com/terinjokes/gulp-uglify
var ngAnnotate = require('gulp-ng-annotate');                   // https://github.com/Kagami/gulp-ng-annotate
var debug = require('gulp-debug');                              // https://github.com/sindresorhus/gulp-debug
var sourcemaps = require('gulp-sourcemaps');                    // https://github.com/floridoo/gulp-sourcemaps
var LessPluginCleanCSS = require('less-plugin-clean-css');      // https://github.com/less/less-plugin-clean-css
var LessPluginAutoPrefix = require('less-plugin-autoprefix');   // https://github.com/less/less-plugin-autoprefix
var cleancss = new LessPluginCleanCSS({ advanced: true });
var autoprefix = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] });
var browserSync = require('browser-sync');                      // https://gist.github.com/sogko/b53d33d4f3b40d3b4b2e

var config = require('../../../config/local.json');

var getSiteConfig = function (siteName) {
  var found = false;
  var result = {};
  for (var i = 0; i < config.sites.length && !found; i++) {
    if(config.sites[i].name === siteName) {
      found = true;
      result = config.sites[i];
    }
  }
  return result;
};

var SOURCES = {
  LIBS: [
    // Dependencies like sails.io.js, jQuery, or Angular
    // are brought in here
  
    //- es5-shim: ECMAScript 5 compatibility shims for legacy JavaScript engines: https://github.com/es-shims/es5-shim
    // 'assets/third-party/es5-shim/es5-shim.js',
    // 'assets/third-party/es5-shim/es5-sham.js',
  
    //- masonry and imagesloaded
    './src/third-party/jquery/dist/jquery.js',
    './src/third-party/jquery-bridget/jquery.bridget.js',
    // 'assets/third-party/get-style-property/get-style-property.js',
    // 'assets/third-party/get-size/get-size.js',
    './src/third-party/eventEmitter/EventEmitter.js',
    './src/third-party/eventie/eventie.js',
    // 'assets/third-party/doc-ready/doc-ready.js',
    // 'assets/third-party/matches-selector/matches-selector.js',
    // 'assets/third-party/outlayer/item.js',
    // 'assets/third-party/outlayer/outlayer.js',
    // 'assets/third-party/masonry/masonry.js',
    './src/third-party/imagesloaded/imagesloaded.js',
  
    //- angular
    './src/third-party/angular/angular.js',
    './src/third-party/angular-i18n/angular-locale_de.js',
    './src/third-party/moment/moment.js',
    './src/third-party/angular-moment/angular-moment.js',
    './src/third-party/moment/locale/de.js',
    './src/third-party/angular-fullscreen/src/angular-fullscreen.js',
    './src/third-party/webodf.js/webodf.js',
    './src/third-party/angular-animate/angular-animate.js',
    './src/third-party/angular-ui-router/release/angular-ui-router.js',
    './src/third-party/angular-sanitize/angular-sanitize.js',
    './src/third-party/angular-touch/angular-touch.js',
    './src/third-party/angular-strap/dist/angular-strap.js',
    './src/third-party/angular-carousel/dist/angular-carousel.js',
    './src/third-party/angular-fullscreen/src/angular-fullscreen.js',
  
    //- textAngular
    //- 'assets/third-party/textAngular/dist/textAngular.min.js',
  
    //- angular-medium-editor
    './src/third-party/medium-editor/dist/js/medium-editor.js',
    './src/third-party/angular-medium-editor/dist/angular-medium-editor.js',
  
    //- angular-ui-ace
    './src/third-party/ace-builds/src-noconflict/ace.js',
    './src/third-party/ace-builds/src-noconflict/mode-html.js',
    './src/third-party/angular-ui-ace/ui-ace.js',
  
    //- angular-masonry
    // 'assets/third-party/angular-masonry/angular-masonry.js',
  
    //- html, css, javascript beautifier
    './src/third-party/js-beautify/js/lib/beautify.js',
    './src/third-party/js-beautify/js/lib/beautify-css.js',
    './src/third-party/js-beautify/js/lib/beautify-html.js',
  
    //- angular-leaflet-directive: https://github.com/tombatossals/angular-leaflet-directive
    './src/third-party/angular-simple-logger/dist/index.js',
    './src/third-party/leaflet/dist/leaflet-src.js',
    './src/third-party/Leaflet.label/dist/leaflet.label-src.js',
    './src/third-party/angular-leaflet-directive/dist/angular-leaflet-directive.js',
  
    //- AngularJS-Toaster: https://github.com/jirikavi/AngularJS-Toaster: https://github.com/jirikavi/AngularJS-Toaster
    './src/third-party/AngularJS-Toaster/toaster.js',
  
    //- async: https://github.com/caolan/async
    './src/third-party/async/lib/async.js',
  
    //- generic angular filters: https://github.com/niemyjski/angular-filters
    './src/third-party/ng-filters/dist/angular-filters.js',
  
    //- angular-file-upload: https://github.com/nervgh/angular-file-upload
    './src/third-party/angular-file-upload/dist/angular-file-upload.min.js',

    //- ngDraggable: https://github.com/fatlinesofcode/ngDraggable
    './src/third-party/ngDraggable/ngDraggable.js',

    //-oh https://github.com/JumpLink/angular-toggle-switch
    './src/third-party/angular-bootstrap-toggle-switch/angular-toggle-switch.js',
  
    //- Bring in the socket.io client
    './src/third-party/socket.io-client/socket.io.js',
    './src/third-party/sails.io.js/sails.io.js',
    './src/third-party/angularSails/dist/ngsails.io.js',

    // https://github.com/rndme/download
    './src/third-party/download/download.js',
  
    './src/third-party/jumplink-cms-angular/src/**/*.js',
  ],
  TEMPLATES: [
    'views/modern/**/*.jade',
    '!views/modern/variables.jade',
  ],
  APP: [
    './src/third-party/jumplink-cms-angular/src/*/*.js',
    './src/js/app.js',
    './src/js/config/*.js',
    './src/js/services/*.js',
    './src/js/controllers/*.js',
    './src/js/directives/*.js',
    './src/js/modules/*.js',
  ],
  STYLES: './src/styles/app.less',
};

var WATCHES = {
  LIBS: SOURCES.LIBS,
  TEMPLATES: SOURCES.TEMPLATES,
  APP: SOURCES.APP,
  STYLES: './src/styles/**/*.less'
};

var DESTS = {
  LIBS: './assets/js/',
  TEMPLATES: './views/html/modern/',
  APP: './assets/js/',
  STYLES: './assets/styles/'
};

/**
 * Seperate watches to work with browser sync,
 * This wasn't possible with gulp-watch, just sass was working with gulp-watch
 * @see https://github.com/BrowserSync/recipes/tree/master/recipes/gulp.jade
 */
gulp.task('jade-watch', ['templates'], browserSync.reload);
gulp.task('app-watch', ['app'], browserSync.reload);
gulp.task('libs-watch', ['libs'], browserSync.reload);

/**
 * The default gulp task
 */
gulp.task('build', ['templates', 'styles', 'libs', 'app'], function () {

});

gulp.task('default', ['templates', 'styles', 'libs', 'app', 'browser-sync'], function () {
  gulp.watch(WATCHES.STYLES, ['styles']);
  gulp.watch(WATCHES.APP, ['app-watch']);
  gulp.watch(WATCHES.LIBS, ['libs-watch']);
  gulp.watch(WATCHES.TEMPLATES, ['jade-watch']);
});

gulp.task('templates', function() {
  var locals = {debug: true, gulp:true};
  return gulp.src(SOURCES.TEMPLATES, {base: "."})
    .pipe(jade({locals: locals}).on('error', console.log))
    .pipe(debug({title: 'templates:'}))
    .pipe(gulp.dest(DESTS.TEMPLATES));
});

gulp.task('libs', function() {
  return gulp.src(SOURCES.LIBS)
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    // .pipe(jshint())
    // .pipe(jshint.reporter('default')) 
    .pipe(concat('libs.js'))
    .pipe(uglify())
    .pipe(sourcemaps.write('/'))
    .pipe(debug({title: 'app:'}))
    .pipe(gulp.dest(DESTS.LIBS));
});

gulp.task('app', function() {
  return gulp.src(SOURCES.APP)
    .pipe(jshint())
    .pipe(jshint.reporter('default')) 
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate())
    .pipe(concat('app.js'))
    .pipe(uglify({mangle: false})) // use mangle because uglify destroys my anglar files if not set
    .pipe(sourcemaps.write('/'))
    .pipe(debug({title: 'app:'}))
    .pipe(gulp.dest(DESTS.APP));
});

gulp.task('styles', function () {
  return gulp.src(SOURCES.STYLES)
    .pipe(sourcemaps.init())
    .pipe(less({
      plugins: [autoprefix, cleancss]
    }))
    .pipe(sourcemaps.write('/'))
    .pipe(debug({title: 'styles:'}))
    .pipe(gulp.dest(DESTS.STYLES))
    .pipe(browserSync.stream());
});

gulp.task('browser-sync', [], function() {
  var siteConfig = getSiteConfig('nvc');
  // console.log("[gulpfile.browser-sync] siteConfig", siteConfig);
  var browserSyncOptions = {
    open: false,
    // proxy: "http://"+siteConfig.domains[0]+":"+(Number(config.port)),
    proxy: "http://"+siteConfig.domains[0],
    port: 7000,
    ws: true
  };
  browserSync.create().init(browserSyncOptions);
  // for (var i = 0; i < config.sites.length; i++) {
  //   var options = {
  //     open:false,
  //     proxy: "http://"+config.sites[i].domains[0]+":"+(Number(config.port)),
  //     port: 7000+i,
  //     ws: true
  //   };
  //   console.log("[browser-sync] options", options);
  //   browserSync.create().init(options);
  // }

});