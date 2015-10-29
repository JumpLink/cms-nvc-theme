jumplink.cms.controller('LayoutController', function($rootScope, $log, authenticated) {
  $rootScope.authenticated = (authenticated === true);
  $log.debug("[LayoutController] authenticated", $rootScope.authenticated, authenticated);

});