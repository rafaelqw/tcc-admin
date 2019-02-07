var baseUrlApi = "http://186.226.56.5:7000";

app.controller('DashboardCtrl', function($scope){
	$scope.title = 'Bem-vindo, esta é nossa página principal!';
});

app.controller('EmpreendimentoCtrl', function($scope, $http){
	$scope.detailEmpreendimento = function(item) {
		$scope.empreendimentoDetail = item;
		$('#modal-empreendimento-detail').modal('show');
	}

	$scope.loadEmpreendimento = function() {
		$scope.empreendimentos = null;

		$http({
			method: 'GET',
			url: baseUrlApi+'/empreendimento'
		}).then(function successCallback(response) {
			$scope.empreendimentos = response.data;
		}, function errorCallback(response) {
			$scope.empreendimentos = [];
		});
	}

	$scope.newEmpreendimento = function(argument) {
		$scope.empreendimento = {};
	}

	$scope.loadEnderecoByCEP = function(){
		if ($scope.empreendimento.cep.length >= 8) {
			$http({
				method: 'GET',
				url: 'https://viacep.com.br/ws/'+ $scope.empreendimento.cep +'/json/'
			}).then(function successCallback(response) {
				$scope.empreendimento.logradouro = response.data.logradouro;
				$scope.empreendimento.bairro = response.data.bairro;
			}, function errorCallback(response) {
				
			});
		}
	}
});