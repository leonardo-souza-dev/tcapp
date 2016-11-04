(function() {

	var tcapp = angular.module('tcapp', ['ngRoute']);

	
	tcapp.config(function($routeProvider, $locationProvider){
		
	    $routeProvider
		    .when("/", {
		        templateUrl: "pages/main.html",
		        controller: 'mainController'
		    })
		    .when("/nova-tarefa", {
		        templateUrl: "pages/nova_tarefa.html",
		        controller: 'mainController'
		    })
				.when("/nova-tarefa/titulo", {
					templateUrl: "pages/opcoes/nova_tarefa_titulo.html",
					controller: 'mainController'
				})
				.when("/nova-tarefa/recorrencia", {
					templateUrl: "pages/opcoes/nova_tarefa_recorrencia.html",
					controller: 'mainController'
				})
				.when("/nova-tarefa/comeca", {
					templateUrl: "pages/opcoes/nova_tarefa_comeca.html",
					controller: 'mainController'
				});

	    $locationProvider.html5Mode(true);
	});

	tcapp.controller('mainController', function($scope, $http, $location) {
		
		$scope.escolherTitulo = function(tit){
			
			$scope.configuracao.titulo = tit;
			console.log('$scope.configuracao.titulo');
			console.log($scope.configuracao.titulo);
		}
		
		$scope.mostrarOpcoesTitulo = function(){
			
			$location.path('/nova-tarefa/titulo');
		}


		obterTarefasDoDia($scope, $http);


		
		$scope.diaAtual = { data: formatarDDMMYYYY(diaInicial) };
		
		
		
		$scope.diaAnterior = { data: formatarDDMMYYYY(addDays(diaInicial, -1)) };
		
		
		
		
		$scope.proximoDia = { data: formatarDDMMYYYY(addDays(diaInicial,1)) };

		

		$http.get('/api/obterTitulos')
			.then(function(response){
				
				$scope.titulos =  response.data.objeto.titulos;
						
			}, function error(response){
		        console.log('ERRO');
		        console.log(response);
			});



		$http.get('/api/obterRecorrencias')
			.then(function(response){

				$scope.recorrencias = response.data.objeto.recorrencias;

			}, function errorCallback(response){
		        console.log('ERRO');
		        console.log(response);
			});



		$scope.comecos = [ { id: '1', descricao:'Hoje' }, { id: 2, descricao: 'Amanhã' }, { id: 3, descricao: 'Depois de Amanhã' }];
		
		
		
		$scope.atualizaInicio = function(){

			$scope.comecos = [ { id: '1', descricao:'Hoje' }, { id: 2, descricao: 'Amanhã' }, { id: 3, descricao: 'Depois de Amanhã' }];
		}



		$scope.gravarNovaConfiguracao = function(configuracao){

	        $http.post('/api/gravarNovaConfiguracao', configuracao)
	            .success(function(data) {
	                $scope.configuracao = {}; 
	                obterTarefasDoDia($scope, $http);
	                $location.path('/');
	            })
	            .error(function(data) {
	                console.log('Error: ' + data.mensagem);
	            });
		}
		
		

		$scope.verProximoDia = function(){ 

			verDiaOffset(1, $scope, $http);
		}
		
		

		$scope.verDiaAnterior = function(){ 

			verDiaOffset(-1, $scope, $http);
		}
		
		

		$scope.concluirTarefa = function(tarefa) {

			if (tarefa.concluida != null && tarefa.concluida == false) {

				tarefa.concluida = true;
				tarefa.estilo = estiloTarefaConcluida;

		        $http
			        .post('/api/concluirTarefa', {
			        	configuracaoId: tarefa.configuracaoId, 
			        	data: tarefa.data,
			        	concluir: true
			        })
		            .success(function(data) {
		                $scope.sistema = {}; 
		                $scope.sistema.resultadocriacao = data.mensagem;
						$scope.sistemas.push(data.objeto.sistema); 
		            })
		            .error(function(data) {
		                console.log('Error: ' + data.mensagem);
		            });
			} else if (tarefa.concluida != null && tarefa.concluida == true) {
				tarefa.concluida = false;
				tarefa.estilo = estiloTarefaNaoConcluida;

		        $http
			        .post('/api/concluirTarefa', {
			        	configuracaoId: tarefa.configuracaoId, 
			        	data: tarefa.data,
			        	concluir: false
			        })
		            .success(function(data) {
		                $scope.sistema = {}; 
		                $scope.sistema.resultadocriacao = data.mensagem;
						$scope.sistemas.push(data.objeto.sistema); 
		            })
		            .error(function(data) {
		                console.log('Error: ' + data.mensagem);
		            });
			}
		}		
	});

	var diaInicial = new Date();

	function obterTarefasDoDia($scope, $http){

		$http.post('/api/obterTarefas', { dia: diaInicial })
			.then( function(response){
				
				console.log(response.data.objeto.tarefas);
				$scope.tarefasDoDia = obterTarefass(response.data.objeto.tarefas);
			}, function error(response){
		        console.log('ERRO');
		        console.log(response);
			});
	}

	var estiloTarefaConcluida = {
				'background-color': '#CCCCCC',
				'color': '#EEEEEE !important',
				'text-decoration': 'line-through'
			};
	var estiloTarefaNaoConcluida = {
				'background-color': '#FFF',
				'color': 'rgba(0,0,0,0.87)',
				'text-decoration': 'none'
			};

	function formatarDDMMYYYY(dateFieldValue){

		var year = dateFieldValue.getFullYear()+"";
		var month = (dateFieldValue.getMonth()+1)+"";
		var day = dateFieldValue.getDate()+"";
		var dateFormat = day + "/" + month + "/" + year;

		return dateFormat;
	}

	function formatarDDMMYYYYHHMM(data){

		var dateFieldValue = new Date();
		var dd = dateFieldValue.getDate() + "";
		var mo = (dateFieldValue.getMonth() + 1) + "";
		var yyyy = dateFieldValue.getFullYear() + "";
		var hh = dateFieldValue.getHours() + "";
		var mm = dateFieldValue.getMinutes() + "";
		var dateFormat = dd + "/" + mo + "/" + yyyy + " " + hh + "h" + mm;

		return dateFormat;
	}


	function addDays(date, days) {
	    var result = new Date(date);
	    result.setDate(result.getDate() + days);
	    return result;
	}

	function obterTarefass(d){

		var tarefas = [];
		var tarefasDb = d;

		var qtd = tarefasDb.length;

		for(i = 0; i < qtd; i++){
			if (tarefasDb[i].concluida == true) {
				tarefasDb[i].estilo = estiloTarefaConcluida;
			} else if (tarefasDb[i].concluida == false) {
				tarefasDb[i].estilo = estiloTarefaNaoConcluida;
			} 
			tarefas.push(tarefasDb[i]);
		}

		return tarefas;
	}

	function verDiaOffset(diaOffset, $scope, $http){

		$http.post('/api/obterTarefas', {dia: addDays(diaInicial, diaOffset)})
			.then(function(response){
				
				diaInicial = addDays(diaInicial, diaOffset);
				
				$scope.diaAtual = { data: formatarDDMMYYYY(diaInicial) };
				$scope.proximoDia = { data: formatarDDMMYYYY(addDays(diaInicial, 1)) };
				$scope.diaAnterior = { data: formatarDDMMYYYY(addDays(diaInicial, -1)) };

				$scope.tarefasDoDia = obterTarefass(response.data.objeto.tarefas);

			}, function error(response){
		        console.log('ERRO');
		        console.log(response);
			});
	}
	

})();