jumplink.cms.directive('jlContent', function ($compile, $window, $sailsSocket, $state) {

  return {
    restrict: 'E',
    templateUrl: 'jlContent',
    scope: {
      authenticated : "=",
      html: "=",
      content: "=",
    },
    link: function ($scope, $element, $attrs) {

      
    }
  };
});
