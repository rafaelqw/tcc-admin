var baseUrlApi = "http://localhost:7000";

app.controller('LoginCtrl', function($scope, $window, $http){
	$scope.dataLogin = {
		email: sessionStorage.getItem('tcc-admin.user.email') ? JSON.parse(sessionStorage.getItem('tcc-admin.user.email')) : "",
		senha: ""
	};

	$scope.empreendimentos = [];

	$scope.selectEmpreendimento = function(item){
		sessionStorage.removeItem('tcc-admin.user.id_empreendimento');
		sessionStorage.setItem('tcc-admin.user.id_empreendimento', JSON.stringify(item.id));
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

	$scope.login = function() {
		sessionStorage.removeItem('tcc-admin.user.token');
		$http({
				method: 'POST',
				url: baseUrlApi+'/autenticacao',
				data: $scope.dataLogin,
				headers: { 
					'Content-Type': 'application/json'
				}
			}).then(function successCallback(response) {
				if (response.data.login == true) {
					$scope.empreendimentos = response.data.empreendimentos;
					sessionStorage.setItem('tcc-admin.user.token', JSON.stringify(response.data.token));
					sessionStorage.setItem('tcc-admin.user.id', JSON.stringify(response.data.id_usuario));
					sessionStorage.setItem('tcc-admin.user.nome', JSON.stringify(response.data.nome_usuario));
					sessionStorage.setItem('tcc-admin.user.email', JSON.stringify($scope.dataLogin.email));
					$('#modal-empreendimentos').modal('show');
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
	$scope.tipos_telefone = [
		{ id: 1, dsc: "FIXO" },
		{ id: 2, dsc: "CELULAR" }
	];

	$scope.maskDate = function() {
		$("input[id*='data_nascimento']").inputmask({
			mask: ['99/99/9999'],
			keepStatic: true
		});
	}

	$scope.maskCpf = function() {
		$("input[id*='cpf']").inputmask({
			mask: ['999.999.999-99'],
			keepStatic: true
		});
	}

	$scope.maskCnpj = function() {
		$("input[id*='cnpj']").inputmask({
			mask: ['99.999.999/9999-99'],
			keepStatic: true
		});
	}

	$scope.maskRG = function() {
		$("input[id*='rg']").inputmask({
			mask: ['99.999.999-9'],
			keepStatic: true
		});
	}


	$scope.loadCliente = function() {
		$scope.clientes = [];
		$scope.msgclientes = null;
		$http({
			method: 'GET',
			url: baseUrlApi+'/cliente',
			headers: {
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			$scope.clientes = response.data;
			angular.forEach($scope.clientes, function(cliente) {
				if ((cliente.PessoaFisicas != null) && cliente.PessoaFisicas.length > 0) {
					cliente.tipo_cadastro = 'pf';
					cliente.nome = cliente.PessoaFisicas[0].nome;
					cliente.cnpjCpf = cliente.PessoaFisicas[0].cpf;
					cliente.sexo = cliente.PessoaFisicas[0].sexo;
				} else {
					cliente.tipo_cadastro = 'pj';
					cliente.nome = cliente.PessoaJuridicas[0].nome_fantasia+"("+ cliente.PessoaJuridicas[0].razao_social +")";
					cliente.cnpjCpf = cliente.PessoaJuridicas[0].cnpj;
					cliente.inscricao_estadual = cliente.PessoaJuridicas[0].inscricao_estadual;
				}
			});
			this.refreshToken($http);
		}, function errorCallback(response) {
			$scope.clientes = null;
			$scope.msgClientes = response.data.msg;
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

	$scope.teste = function() {
		console.log($scope.clientes);
	}

	$scope.newCliente = function(){
		$scope.cliente = {
			tipo_cadastro: "pf",
			telefones: []
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
			/* Cliente Pessoa Física */
			nome: $scope.cliente.nome,
			cpf: $scope.cliente.cpf,
			rg: $scope.cliente.rg,
			data_nascimento: moment($scope.cliente.data_nascimento, 'DD/MM/YYYY').format('YYYY-MM-DD'),
			sexo: $scope.cliente.sexo,
			/* Cliente Pessoa Jurídica */
			nome_fantasia: $scope.cliente.nome_fantasia,
			razao_social: $scope.cliente.razao_social,
			cnpj: $scope.cliente.cnpj,
			inscricao_estadual: $scope.cliente.inscricao_estadual,
			telefones: $scope.cliente.telefones
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
			$scope.newCliente();
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

	$scope.loadEnderecoByCEP = function(){
		if ($scope.cliente.cep.length >= 8) {
			$http({
				method: 'GET',
				url: 'https://viacep.com.br/ws/'+ $scope.cliente.cep +'/json/'
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
					$scope.cliente.logradouro = response.data.logradouro;
					$scope.cliente.bairro = response.data.bairro;
					angular.forEach($scope.estados, function(estado) {
						if (estado.uf == response.data.uf){
							$scope.cliente.id_estado = estado.cod_ibge;
							$scope.loadMunicipios(response.data.ibge);
						}
					});
					$('#cliNumero').focus();
				}
			}, function errorCallback(response) {
				
			});
		}
	}

	$scope.detailCliente = function(item) {
		$scope.clienteDetail = item;
		$scope.loadEstados();
		$scope.loadMunicipios($scope.clienteDetail.id_municipio);
		$('#modal-cliente-detail').modal('show');
	}

	$scope.addTelefone = function() {
		$scope.cliente.telefones.push($scope.telefone);
		$scope.telefone = {};
	}

	$scope.delTelefone = function(telefone) {
		$scope.cliente.telefones.splice(telefone, 1);
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

	$scope.maskCnpj = function() {
		$("input[id*='cnpj']").inputmask({
			mask: ['99.999.999/9999-99'],
			keepStatic: true
		});
	}

	$scope.detailEmpreendimento = function(item) {
		$scope.empreendimentoDetail = item;
		$scope.loadEstados();
		$scope.loadMunicipios($scope.empreendimentoDetail.id_municipio);
		$('#modal-empreendimento-detail').modal('show');
		if (($scope.empreendimentoDetail.Cliente.PessoaFisicas != null) && $scope.empreendimentoDetail.Cliente.PessoaFisicas.length > 0) {
			$scope.empreendimentoDetail.nome_cliente = $scope.empreendimentoDetail.Cliente.PessoaFisicas[0].nome;
		} else {
			$scope.empreendimentoDetail.nome_cliente = $scope.empreendimentoDetail.Cliente.PessoaJuridicas[0].nome_fantasia+"("+ $scope.empreendimentoDetail.Cliente.PessoaJuridicas[0].razao_social +")";
		}
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
			$http({
				method: 'GET',
				url: 'https://viacep.com.br/ws/'+ $scope.empreendimento.cep +'/json/'
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
					$scope.empreendimento.logradouro = response.data.logradouro;
					$scope.empreendimento.bairro = response.data.bairro;
					angular.forEach($scope.estados, function(estado) {
						if (estado.uf == response.data.uf){
							$scope.empreendimento.id_estado = estado.cod_ibge;
							$scope.loadMunicipios(response.data.ibge);
						}
					});
					$('#empNumero').focus();
				}
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

app.controller('UsuarioCtrl', function($scope, $http){
	var token = JSON.parse(sessionStorage.getItem('tcc-admin.user.token'));

	$scope.detailEmpreendimento = function(item) {
		$scope.usuarioDetail = item;
	}

	$scope.loadUsuario = function() {
		$scope.usuarios = [];
		$scope.msgUsuarios = null;
		$http({
			method: 'GET',
			url: baseUrlApi+'/autenticacao',
			headers: {
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			$scope.usuarios = response.data;
			this.refreshToken($http);
		}, function errorCallback(response) {
			$scope.usuarios = null;
			$scope.msgUsuarios = response.data.msg;
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

	$scope.newUsuario = function() {
		$scope.usuario = {};
		$scope.municipios = null;
	}

	$scope.loadEmpreendimento = function() {
		$scope.empreendimentos = [];
		$scope.msgEmpreendimentos = null;
		$http({
			method: 'GET',
			url: baseUrlApi+'/empreendimento/id_usuario/'+JSON.parse(sessionStorage.getItem('tcc-admin.user.id')),
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

	$scope.detailEmpreendimento = function(item) {
		$scope.empreendimentoDetail = item;
		$scope.loadEstados();
		$scope.loadMunicipios($scope.empreendimentoDetail.id_municipio);
		$('#modal-empreendimento-detail').modal('show');
		if (($scope.empreendimentoDetail.Cliente.PessoaFisicas != null) && $scope.empreendimentoDetail.Cliente.PessoaFisicas.length > 0) {
			$scope.empreendimentoDetail.nome_cliente = $scope.empreendimentoDetail.Cliente.PessoaFisicas[0].nome;
		} else {
			$scope.empreendimentoDetail.nome_cliente = $scope.empreendimentoDetail.Cliente.PessoaJuridicas[0].nome_fantasia+"("+ $scope.empreendimentoDetail.Cliente.PessoaJuridicas[0].razao_social +")";
		}
	}
});

app.controller('DispositivoCtrl', function($scope, $http){
});

app.controller('SensorCtrl', function($scope, $http){
});

function refreshToken($http){
	var token = JSON.parse(sessionStorage.getItem('tcc-admin.user.token'));
	$http({
			method: 'POST',
			url: baseUrlApi+'/autenticacao/refresh-token',
			headers: { 
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' +token
			}
		}).then(function successCallback(response) {
			sessionStorage.setItem('tcc-admin.user.token', JSON.stringify(response.data.token))
		}, function errorCallback(response) { });
}