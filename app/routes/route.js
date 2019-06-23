app.config(function($routeProvider) {
	$routeProvider
		.when("/", {
			templateUrl : "app/views/dashboard.html"
		})
		.when("/empreendimento-new", {
			templateUrl : "app/views/empreendimento-new.html",
			controller : "EmpreendimentoCtrl"
		})
		.when("/empreendimento-list", {
			templateUrl : "app/views/empreendimento-list.html",
			controller : "EmpreendimentoCtrl"
		})

		.when("/cliente-new", {
			templateUrl : "app/views/cliente-new.html",
			controller : "ClienteCtrl"
		})
		.when("/cliente-list", {
			templateUrl : "app/views/cliente-list.html",
			controller : "ClienteCtrl"
		})

		.when("/usuario-new", {
			templateUrl : "app/views/usuario-new.html",
			controller : "UsuarioCtrl"
		})
		.when("/usuario-list", {
			templateUrl : "app/views/usuario-list.html",
			controller : "UsuarioCtrl"
		})

		.when("/dispositivo-new", {
			templateUrl : "app/views/dispositivo-new.html",
			controller : "DispositivoCtrl"
		})
		.when("/dispositivo-list", {
			templateUrl : "app/views/dispositivo-list.html",
			controller : "DispositivoCtrl"
		})

		.when("/sensor-new", {
			templateUrl : "app/views/sensor-new.html",
			controller : "SensorCtrl"
		})
		.when("/sensor-list", {
			templateUrl : "app/views/sensor-list.html",
			controller : "SensorCtrl"
		})

		.otherwise ({ redirectTo: '/' });
});