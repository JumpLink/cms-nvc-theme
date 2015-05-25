jumplink.cms.service('UtilityService', function () {
  var invertOrder = function (array) {
    var result = [];
    for (var i = array.length - 1; i >= 0; i--) {
      result.push(array[i]);
    };
    return result;
  }
  return {
    invertOrder: invertOrder
  };
});