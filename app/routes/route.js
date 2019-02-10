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

		.otherwise ({ redirectTo: '/' });
});