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

		.when("/usuario-new", {
			templateUrl : "app/views/usuario-new.html",
			controller : "usuarioCtrl"
		})
		.when("/usuario-list", {
			templateUrl : "app/views/usuario-list.html",
			controller : "EmpreendimentoCtrl"
		})

		.otherwise ({ redirectTo: '/' });
});