// public/core.js
var tcapp = angular.module('tcapp', []);
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

function obterTarefas($scope, $http){
	
	$http.get('/api/obterTarefas').success(function(data){

		//console.log('data');console.log(data);console.log('');

		//$scope.tarefas = data.objeto.tarefas;
	}).error(function(data){
        console.log('');
	});
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

var diaInicial = new Date();

function mainController($scope, $http, $scope) {


	$scope.tarefasDoDia = $http.post('/api/obterTarefas', {dia: diaInicial}).then( function successCallback(response){
		
		return obterTarefass(response.data.objeto.tarefas);
	}, function errorCallback(response){
        console.log('ERRO');
        console.log(response);
	});

	
	
	$scope.diaAtual = { data: formatarDDMMYYYY(diaInicial) };
	
	
	
	$scope.diaAnterior = { data: formatarDDMMYYYY(addDays(diaInicial, -1)) };
	
	
	
	$scope.proximoDia = { data: formatarDDMMYYYY(addDays(diaInicial,1)) };

	

	$scope.titulos = $http.get('/api/obterTitulos').then(function successCallback(response){
		
		return response.data.objeto.titulos;
				
	}, function errorCallback(response){
        console.log('ERRO');
        console.log(response);
	});



	$scope.recorrencias= $http.get('/api/obterRecorrencias').then(function successCallback(response){

		return response.data.objeto.recorrencias;

	}, function errorCallback(response){
        console.log('ERRO');
        console.log(response);
	});



	$scope.novaTarefa = function() {

		$scope.novaTarefaEscondida = !$scope.novaTarefaEscondida;
	}
	
	

	$scope.home = function() {

		if (!$scope.novaTarefaEscondida) {
			$scope.novaTarefaEscondida = true;
		}
	}



	$scope.comecos = [ { id: '1', descricao:'Hoje' }, { id: 2, descricao: 'Amanhã' }, { id: 3, descricao: 'Depois de Amanhã' }];
	
	
	
	$scope.atualizaInicio = function(){

		$scope.comecos = [ { id: '1', descricao:'Hoje' }, { id: 2, descricao: 'Amanhã' }, { id: 3, descricao: 'Depois de Amanhã' }];
	}



	$scope.gravarNovaConfiguracao = function(configuracao){

        $http.post('/api/gravarNovaConfiguracao', configuracao)
            .success(function(data) {
            	$scope.novaTarefaEscondida = true;
                $scope.configuracao = {}; 
            })
            .error(function(data) {
                console.log('Error: ' + data.mensagem);
            });
	}
	
	

	$scope.verProximoDia = function(){ 
	
		var mDia = addDays(diaInicial,1);
		console.log('mDia');
		console.log(mDia);

		$scope.tarefasDoDia = $http.post('/api/obterTarefas', {dia: mDia}).then( function successCallback(response){
				
				diaInicial = addDays(diaInicial, 1);
				
				$scope.diaAtual = { data: formatarDDMMYYYY(diaInicial) };
				$scope.proximoDia = { data: formatarDDMMYYYY(addDays(diaInicial,1)) };
				$scope.diaAnterior = { data: formatarDDMMYYYY(addDays(diaInicial, -1)) };
				
				console.log('!!!!!!!!!!!!!!');
				console.log(response.data.objeto.tarefas);
				
				return obterTarefass(response.data.objeto.tarefas);

			}, function errorCallback(response){
		        console.log('ERRO');
		        console.log(response);
			});
	}
	
	

	$scope.verDiaAnterior = function(){ 

		var diaAConsultar = addDays(diaInicial, -1);

		$scope.tarefasDoDia = $http.post('/api/obterTarefas', {dia: diaAConsultar}).then( function successCallback(response){
				
				diaInicial = diaAConsultar;
				
				$scope.diaAtual = { data: formatarDDMMYYYY(diaInicial) };
				$scope.proximoDia = { data: formatarDDMMYYYY(addDays(diaInicial, 1)) };
				$scope.diaAnterior = { data: formatarDDMMYYYY(addDays(diaInicial, -1)) };
				
				console.log('!!!!!!!!!!!!!!');
				console.log(response.data.objeto.tarefas);

				return obterTarefass(response.data.objeto.tarefas);

			}, function errorCallback(response){
		        console.log('ERRO');
		        console.log(response);
			});
	}
	
	

	$scope.concluirTarefa = function(tarefa) {

		if (tarefa.estaConcluida != null && tarefa.estaConcluida == false) {
			tarefa.estaConcluida = true;
			tarefa.estilo = estiloTarefaConcluida;

	        $http.post('/api/concluirTarefa', {configuracaoId: tarefa.configuracaoId})
	            .success(function(data) {
	                $scope.sistema = {}; 
	                $scope.sistema.resultadocriacao = data.mensagem;
					$scope.sistemas.push(data.objeto.sistema); 
	            })
	            .error(function(data) {
	                console.log('Error: ' + data.mensagem);
	            });
			console.log('tarefa ' + tarefa.titulo + ' acabada em ' + formatarDDMMYYYYHHMM(new Date()));
		} else {
			tarefa.estaConcluida = false;
			tarefa.estilo = estiloTarefaNaoConcluida;
		}
	}
	
	
	
}