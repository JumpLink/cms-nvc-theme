jumplink.cms.directive('adminbar', function ($compile, $window, $sailsSocket, $state) {

  return {
    restrict: 'E',
    templateUrl: 'adminbar',
    scope: {download : "=", refresh: "=", toogleHtml: "=", refresh: "=", save: "="},
    link: function ($scope, $element, $attrs) {

      $scope.goToState = $state.go;

      $scope.adminSettingDropdown = [
        {
          "text": "<i class=\"fa fa-list\"></i>&nbsp;Übersicht",
          "click": "goToState('layout.administration')"
        },
        {
          "text": "<i class=\"fa fa-users\"></i>&nbsp;Benutzer",
          "click": "goToState('layout.users')"
        },
        {
          "text": "<i class=\"fa fa-sign-out\"></i>&nbsp;Abmelden",
          "click": "$root.logout()"
        }
      ];
      
    }
  };
});
