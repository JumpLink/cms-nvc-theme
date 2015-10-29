jumplink.cms.config( function($logProvider) {
  // see init.jade environment variable
  $logProvider.debugEnabled(environment === 'development');
});