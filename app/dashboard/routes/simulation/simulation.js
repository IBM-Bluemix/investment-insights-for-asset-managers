(function(){
  var app = angular.module('app');

  app.config(function($stateProvider, $urlRouterProvider) {
    $stateProvider.state('simulation', {
      url: '/simulation',
      templateUrl: 'routes/simulation/simulation.html',
      css: 'routes/simulation/simulation.css'
    });
  });

  app.controller('SimulationController', ['$scope', '$state', '$stateParams', 'StateService', 'SimulationService',
    function($scope, $state, $stateParams, StateService, SimulationService) {
      var controller = this;

      $scope.state = StateService;
      $scope.selectedHoldings = [];

      $scope.hasNews = function() {
        var news =  StateService.get('news');
        return news && news.results && news.results.length > 0;
      }

      $scope.hasPortfolio = function() {
        var portfolio = StateService.get('portfolios.selected');
        return portfolio && portfolio.holdings;
      }

      $scope.runSimulation = function() {
        var portfolio = StateService.get('portfolios.selected');
        var riskFactor = StateService.get('news.riskFactor');
        var shockValue = StateService.get('news.shockValue');

        var instrumentIds = portfolio.holdings.map(function(holding) { return holding.instrumentId; });

        SimulationService.simulate(instrumentIds, riskFactor, shockValue).then(function(simulation) {
          console.log('Received simulation data', simulation);

          var instrumentIdToSimulation = {};
          simulation.forEach(function(item) {
            if (!instrumentIdToSimulation[item.instrument]) {
              instrumentIdToSimulation[item.instrument] = {}
            }
            if (item.scenario === 'Base Scenario (0.0000)') {
              instrumentIdToSimulation[item.instrument].currentPrice = item.values[0]['THEO/Price'];
            } else if (item.scenario === 'CONDITIONAL_1 (1.0000)') {
              instrumentIdToSimulation[item.instrument].stressedPrice = item.values[0]['THEO/Price'];
            }
          });

          $scope.simulationResults = portfolio.holdings.map(function(holding) {
            var result = JSON.parse(JSON.stringify(holding));
            result.currentPrice = instrumentIdToSimulation[result.instrumentId].currentPrice;
            result.stressedPrice = instrumentIdToSimulation[result.instrumentId].stressedPrice;
            result.profitLoss = (((parseFloat(result.stressedPrice) / parseFloat(result.currentPrice))-1)*100);
            return result;
          });

          console.log('Prepared simulation results', $scope.simulationResults);
        });
      }
    }]);

})();
