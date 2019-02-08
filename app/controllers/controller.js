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

	$scope.saveEmpreendimento = function() {
		var body = {
			nome: $scope.empreendimento.nome,
			descricao: $scope.empreendimento.descricao,
			cnpj: $scope.empreendimento.cnpj,
			cep: $scope.empreendimento.cep,
			endereco: $scope.empreendimento.endereco,
			numero: $scope.empreendimento.numero,
			bairro: $scope.empreendimento.bairro,
			id_estado: $scope.empreendimento.id_estado,
			id_cidade: $scope.empreendimento.id_cidade,
			id_segmento: $scope.empreendimento.id_segmento,
			id_nivel: $scope.empreendimento.id_nivel,
			id_cliente: $scope.empreendimento.id_cliente
		};

		$http({
				method: 'POST',
				url: baseUrlApi+'/empreendimento',
				data: body,
				headers: { 
					'Content-Type': 'application/json'
				}
			}).then(function successCallback(response) {
				$scope.empreendimento.logradouro = response.data.logradouro;
				$scope.empreendimento.bairro = response.data.bairro;
			}, function errorCallback(response) {
				
			});
	}
});