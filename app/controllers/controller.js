var baseUrlApi = "http://localhost:7000";

app.controller('LoginCtrl', function($scope, $window, $http){
	$scope.dataLogin = {
		email: "",
		senha: ""
	};
	$scope.login = function() {
		$http({
				method: 'POST',
				url: 'http://localhost:7000/autenticacao',
				data: $scope.dataLogin,
				headers: { 
					'Content-Type': 'application/json'
				}
			}).then(function successCallback(response) {
				if (response.data.login == true) {
					$.toast({
						heading: 'Sucesso!',
						text: 'Login realizado!',
						position: 'top-right',
						loaderBg:'#ff6849',
						icon: 'success',
						hideAfter: 3500
					});
					window.location = 'index.php';
				}
			}, function errorCallback(response) {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			});
	}
});

app.controller('DashboardCtrl', function($scope){
	$scope.title = 'Bem-vindo, esta é nossa página principal!';
});

app.controller('EmpreendimentoCtrl', function($scope, $http){
	$scope.segmentos = [
		{ id: 1, dsc: "Residência" },
		{ id: 2, dsc: "Comércio" },
		{ id: 3, dsc: "Indústria" },
	];

	$scope.portes = [
		{ id: 1, dsc: "Pequeno" },
		{ id: 2, dsc: "Médio" },
		{ id: 3, dsc: "Grande" },
	];

	$scope.detailEmpreendimento = function(item) {
		$scope.empreendimentoDetail = item;
		$scope.loadEstados();
		$scope.loadMunicipios($scope.empreendimentoDetail.id_estado);
		$('#modal-empreendimento-detail').modal('show');
	}

	$scope.loadEmpreendimento = function() {
		$scope.empreendimentos = [];
		$scope.msgEmpreendimentos = null;
		$http({
			method: 'GET',
			url: baseUrlApi+'/empreendimento'
		}).then(function successCallback(response) {
			$scope.empreendimentos = response.data;
			angular.forEach($scope.empreendimentos, function(empreendimento){
				switch(empreendimento.id_segmento){
					case 1:
						empreendimento.dsc_segmento = "Residência";
						break;
					case 2:
						empreendimento.dsc_segmento = "Comércio";
						break;
					case 3:
						empreendimento.dsc_segmento = "Indústria";
						break;
				}

				switch(empreendimento.id_porte){
					case 1:
						empreendimento.dsc_porte = "Pequeno";
						break;
					case 2:
						empreendimento.dsc_porte = "Médio";
						break;
					case 3:
						empreendimento.dsc_porte = "Grande";
						break;
				}
			});
		}, function errorCallback(response) {
			$scope.empreendimentos = null;
			$scope.msgEmpreendimentos = response.data.msg;
		});
	}

	$scope.newEmpreendimento = function(argument) {
		$scope.loadEstados();
		$scope.loadClientes();
		$scope.empreendimento = {};
		$scope.municipios = null;
	}

	$scope.showModalCliente = function() {
		$('#modal-cliente').modal('show');
	}

	$scope.loadClientes = function(){
		$scope.clientes = [];
		$scope.msgClientes = null;
		$http({
			method: 'GET',
			url: baseUrlApi+'/cliente'
		}).then(function successCallback(response) {
			$scope.clientes = response.data;
			angular.forEach($scope.clientes, function(cliente){
				if (cliente.PessoaJuridicas.length > 0) {
					cliente.nome = cliente.PessoaJuridicas[0].nome_fantasia;
					cliente.razao_social = cliente.PessoaJuridicas[0].razao_social;
					cliente.inscricao_estadual = cliente.PessoaJuridicas[0].inscricao_estadual;
					cliente.cnpjCpf = cliente.PessoaJuridicas[0].cnpj;
				} else if (cliente.PessoaFisicas.length > 0){
					cliente.nome = cliente.PessoaFisicas[0].nome;
					cliente.cnpjCpf = cliente.PessoaFisicas[0].cpf;
				}
			})
		}, function errorCallback(response) {
			$scope.clientes = null;
			$scope.msgClientes = response.data.msg;
		});
	}

	$scope.loadEnderecoByCEP = function(){
		if ($scope.empreendimento.cep.length >= 8) {
			$http({
				method: 'GET',
				url: 'https://viacep.com.br/ws/'+ $scope.empreendimento.cep +'/json/'
			}).then(function successCallback(response) {
				$scope.empreendimento.logradouro = response.data.logradouro;
				$scope.empreendimento.bairro = response.data.bairro;
				angular.forEach($scope.estados, function(estado) {
					if (estado.uf == response.data.uf){
						$scope.empreendimento.id_estado = estado.cod_ibge;
						$scope.loadMunicipios(response.data.ibge);
					}
				});
				$('#empNumero').focus();
			}, function errorCallback(response) {
				
			});
		}
	}

	$scope.saveEmpreendimento = function() {
		var btn = $('#salvar-empreendimento');
		btn.button('loading');
		var body = {
			nome: $scope.empreendimento.nome,
			descricao: $scope.empreendimento.descricao,
			cnpj: $scope.empreendimento.cnpj,
			cep: $scope.empreendimento.cep,
			logradouro: $scope.empreendimento.logradouro,
			numero: $scope.empreendimento.numero,
			bairro: $scope.empreendimento.bairro,
			id_estado: $scope.empreendimento.id_estado,
			id_municipio: $scope.empreendimento.id_municipio,
			id_segmento: $scope.empreendimento.id_segmento,
			id_porte: $scope.empreendimento.id_porte,
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
				$scope.empreendimento = {};
				btn.button('reset');
				$.toast({
					heading: 'Sucesso!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#ff6849',
					icon: 'success',
					hideAfter: 3500
				});
				$scope.newEmpreendimento();
			}, function errorCallback(response) {
				btn.button('reset');
				$.toast({
					heading: 'Atenção!',
					text: 'Erro ao cadastrar empreendimento',
					position: 'top-right',
					loaderBg:'#ff6849',
					icon: 'success',
					hideAfter: 3500
				});
			});
	}

	$scope.addCliente = function(cliente) {
		angular.forEach($scope.clientes, function(item) {
			item.selected = false;
		})
		cliente.selected = true;
		$scope.empreendimento.nome_cliente = cliente.nome;
		$scope.empreendimento.id_cliente = cliente.id;
		$('#modal-cliente').modal('hide');
	}

	$scope.loadEstados = function() {
		$http({
			method: 'GET',
			url: baseUrlApi+'/estado'
		}).then(function successCallback(response) {
			$scope.estados = response.data;
		}, function errorCallback(response) {
			
		});
	}

	$scope.loadMunicipios = function(cod_ibge_municipio) {
		var id_estado = $scope.empreendimento ? $scope.empreendimento.id_estado : $scope.empreendimentoDetail.id_estado;
		$http({
			method: 'GET',
			url: baseUrlApi+'/municipio/'+ id_estado
		}).then(function successCallback(response) {
			$scope.municipios = response.data;
			if (cod_ibge_municipio) {
				angular.forEach($scope.municipios, function(municipio) {
					if ($scope.empreendimento) {
						if (municipio.cod_ibge == parseInt(cod_ibge_municipio))
							$scope.empreendimento.id_municipio = municipio.cod_ibge;
					} else if ($scope.empreendimentoDetail) {
						if (municipio.cod_ibge == parseInt(cod_ibge_municipio))
							$scope.empreendimentoDetail.id_municipio = municipio.cod_ibge;
					}
				});
			}
		}, function errorCallback(response) {
			
		});
	}

});