(function () {
  angular.module('app')
    .service('PortfolioService', ['$http', '$q', PortfolioService]);

  function PortfolioService($http, $q) {
    console.log('PortfolioService loading...');
    var self = this;
    return {
      getPortfolios: function() {
        var deferred = $q.defer();
        $http.get('api/portfolios.json').then(function(response) {
          deferred.resolve(response.data.portfolios);
        }).catch(function(err) {
          console.log(err);
          deferred.reject();
        });
        return deferred.promise;
      }
    };
  }

})();
