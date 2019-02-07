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

		.otherwise ({ redirectTo: '/' });
});