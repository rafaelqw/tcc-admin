var baseUrlApi = "http://localhost:7000";

app.controller('LoginCtrl', function($scope, $window, $http){
	$scope.dataLogin = {
		email: sessionStorage.getItem('tcc-admin.user.email') ? JSON.parse(sessionStorage.getItem('tcc-admin.user.email')) : "",
		senha: ""
	};
	$scope.login = function() {
		sessionStorage.removeItem('tcc-admin.user.token');
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
					sessionStorage.setItem('tcc-admin.user.token', JSON.stringify(response.data.token));
					sessionStorage.setItem('tcc-admin.user.email', JSON.stringify($scope.dataLogin.email));
					window.location = 'index.php';
				} else {
					$.toast({
						heading: 'Atenção!',
						text: response.data.msg,
						position: 'top-right',
						loaderBg:'#dc3545',
						icon: 'error',
						hideAfter: 3500
					});
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

app.controller('ClienteCtrl', function($scope, $http){
	var token = JSON.parse(sessionStorage.getItem('tcc-admin.user.token'));

	$scope.newCliente = function(){
		$scope.cliente = {
			tipo_cadastro: "pf"
		};
		$scope.loadEstados();
	}

	$scope.saveCliente = function(){
		var btn = $('#salvar-cliente');
		btn.button('loading');
		var body = {
			email: $scope.cliente.email,
			cep: $scope.cliente.cep,
			logradouro: $scope.cliente.logradouro,
			numero: $scope.cliente.numero,
			bairro: $scope.cliente.bairro,
			id_estado: $scope.cliente.id_estado,
			id_municipio: $scope.cliente.id_municipio,
			complemento: $scope.cliente.complemento,
			id_segmento: $scope.cliente.id_segmento,
			id_porte: $scope.cliente.id_porte,
			tipo_cadastro: $scope.cliente.tipo_cadastro,
			/* Cliente Pessoal Física */
			nome: $scope.cliente.nome,
			cpf: $scope.cliente.cpf,
			rg: $scope.cliente.rg,
			data_nascimento: $scope.cliente.data_nascimento,
			sexo: $scope.cliente.sexo,
			/* Cliente Pessoa Jurídica */
			nome_fantasia: $scope.cliente.nome_fantasia,
			razao_social: $scope.cliente.razao_social,
			cnpj: $scope.cliente.cnpj,
			inscricao_estadual: $scope.cliente.inscricao_estadual,
			telefones: []
		};

		$http({
			method: 'POST',
			url: baseUrlApi+'/cliente',
			data: body,
			headers: { 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			$scope.cliente = {
				tipo_cadastro: "pf"
			};
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
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
		});
	}

	$scope.loadEstados = function() {
		$http({
			method: 'GET',
			url: baseUrlApi+'/estado',
			headers: {
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			$scope.estados = response.data;
		}, function errorCallback(response) {
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
		});
	}

	$scope.loadMunicipios = function(cod_ibge_municipio) {
		var id_estado = $scope.cliente ? $scope.cliente.id_estado : $scope.clienteDetail.id_estado;
		$http({
			method: 'GET',
			url: baseUrlApi+'/municipio/'+ id_estado,
			headers: {
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			$scope.municipios = response.data;
			if (cod_ibge_municipio) {
				angular.forEach($scope.municipios, function(municipio) {
					if ($scope.cliente) {
						if (municipio.cod_ibge == parseInt(cod_ibge_municipio))
							$scope.cliente.id_municipio = municipio.cod_ibge;
					} else if ($scope.clienteDetail) {
						if (municipio.cod_ibge == parseInt(cod_ibge_municipio))
							$scope.clienteDetail.id_municipio = municipio.cod_ibge;
					}
				});
			}
		}, function errorCallback(response) {
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
		});
	}
});

app.controller('EmpreendimentoCtrl', function($scope, $http){
	var token = JSON.parse(sessionStorage.getItem('tcc-admin.user.token'));

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
			url: baseUrlApi+'/empreendimento',
			headers: {
				'Authorization': 'Bearer ' +token
			}
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
			this.refreshToken($http);
		}, function errorCallback(response) {
			$scope.empreendimentos = null;
			$scope.msgEmpreendimentos = response.data.msg;
			if (response.data.erro) {
				if (response.data.erro.name == "TokenExpiredError") {
					window.location = 'lock-screen.html';
				}
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
				this.refreshToken($http);
			}
		});
	}

	$scope.newEmpreendimento = function() {
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
			url: baseUrlApi+'/cliente',
			headers: {
				'Authorization': 'Bearer ' +token
			}
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
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
		});
	}

	$scope.loadEnderecoByCEP = function(){
		if ($scope.empreendimento.cep.length >= 8) {
			var endereco = loadEnderecoByCEP($http, $scope.empreendimento.cep);
			$scope.empreendimento.logradouro = endereco.logradouro;
			$scope.empreendimento.bairro = endereco.bairro;
			angular.forEach($scope.estados, function(estado) {
				if (estado.uf == endereco.uf){
					$scope.empreendimento.id_estado = estado.cod_ibge;
					$scope.loadMunicipios(endereco.ibge);
				}
			});
			$('#empNumero').focus();
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
			id_cliente: $scope.empreendimento.id_cliente,
			complemento: $scope.empreendimento.complemento
		};

		$http({
			method: 'POST',
			url: baseUrlApi+'/empreendimento',
			data: body,
			headers: { 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' +token
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
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
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
			url: baseUrlApi+'/estado',
			headers: {
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			$scope.estados = response.data;
		}, function errorCallback(response) {
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
		});
	}

	$scope.loadMunicipios = function(cod_ibge_municipio) {
		var id_estado = $scope.empreendimento ? $scope.empreendimento.id_estado : $scope.empreendimentoDetail.id_estado;
		$http({
			method: 'GET',
			url: baseUrlApi+'/municipio/'+ id_estado,
			headers: {
				'Authorization': 'Bearer ' +token
			}
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
			if (response.data.erro.name == "TokenExpiredError") {
				window.location = 'lock-screen.html';
			} else {
				$.toast({
					heading: 'Atenção!',
					text: response.data.msg,
					position: 'top-right',
					loaderBg:'#dc3545',
					icon: 'error',
					hideAfter: 3500
				});
			}
		});
	}
});

async function loadEnderecoByCEP($http, cep){
	$http({
		method: 'GET',
		url: 'https://viacep.com.br/ws/'+ cep +'/json/'
	}).then(function successCallback(response) {
		if(response.data.erro){
			$.toast({
				heading: 'Atenção!',
				text: 'Erro ao buscar o CEP',
				position: 'top-right',
				loaderBg:'#dc3545',
				icon: 'error',
				hideAfter: 3500
			});
		} else {
			return response.data;
		}
	}, function errorCallback(response) {
		
	});
}

function refreshToken($http){
	var token = JSON.parse(sessionStorage.getItem('tcc-admin.user.token'));
	$http({
			method: 'POST',
			url: 'http://localhost:7000/autenticacao/refresh-token',
			headers: { 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			sessionStorage.setItem('tcc-admin.user.token', JSON.stringify(response.data.token))
		}, function errorCallback(response) { });
}