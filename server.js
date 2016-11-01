// server.js
// set up ========================
var express = require('express');
var app = express();
var mysql = require('mysql');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var async = require('async');
var Sequelize = require('sequelize');
var Enumerable = require('linq');


// configuration =================
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
var connStr = 'mysql://y51n036oz366vj1q:f56ttmh72xf3vei2@z37udk8g6jiaqcbx.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/hjqoto3qzd8dzwaw';
var connection = mysql.createConnection(connStr);


//ORM
var sequelize = new Sequelize(connStr,   { 
    define: { 
        timestamps: false, 
        freezeTableName: true
        //,timezone: '-03:00'  
    }
});

//utils
function obterAno(data){

    return data.substring(0,4);
}
function obterMes(data){

    return data.substring(5,7);
}
function obterDia(data){

    return data.substring(8,10);
}
function formatarYYYYMMDD(dateFieldValue){

	var year = dateFieldValue.getFullYear()+"";
	var month = (dateFieldValue.getMonth()+1)+"";
	var day = dateFieldValue.getDate()+"";
	var dateFormat = year + "-" + month + "-" + day;

	return dateFormat;
}

function helpList(tarefa, lista){
    console.log('****************************************');
    console.log('tarefas');
    console.log(JSON.stringify(tarefa));
    console.log('');
    var tem = false;
    for (j = 0; j < lista.length; j++) {
    //console.log('****************************************');
    //console.log('lista[j].configuracaoId');
    //console.log(JSON.stringify(lista[j].configuracaoId));
    //console.log(lista[j].configuracaoId);
    //console.log('');
        if (tarefa.configuracaoId === lista[j].configuracaoId) {
            tem = true;
        }
    }
    return tem;
}

var Recorrencia = sequelize.define('recorrencia', {
        recorrenciaId: { 
            type: Sequelize.INTEGER, 
            field: 'recorrenciaId', 
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true 
        },
        descricao: { 
            type: Sequelize.STRING, 
            field: 'descricao',
            allowNull: false  
        }
    },{ tableName: 'Recorrencia' }
);

var Titulo = sequelize.define('titulo', {
        tituloId: { 
            type: Sequelize.INTEGER, 
            field: 'tituloId', 
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true 
        },
        descricao: { 
            type: Sequelize.STRING, 
            field: 'descricao',
            allowNull: false  
        }
    },{ tableName: 'Titulo' }
);

var Configuracao = sequelize.define('configuracao', {
        configuracaoId: { 
            type: Sequelize.INTEGER, 
            field: 'configuracaoId', 
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true 
        },
        tituloId: { 
            type: Sequelize.INTEGER, 
            field: 'tituloId',
            allowNull: false  
        },
        recorrenciaId: { 
            type: Sequelize.INTEGER, 
            field: 'recorrenciaId',
            allowNull: false  
        },
        inicioSet: { 
            type: Sequelize.DATEONLY, 
            field: 'inicioSet',
            allowNull: false  
        },
        inicioGet: { 
            type: Sequelize.DATEONLY, 
            field: 'inicioGet',
            allowNull: false  
        },
        ativo: { 
            type: Sequelize.BOOLEAN, 
            field: 'ativo',
            allowNull: true  
        },
        dataCriacao: { 
            type: Sequelize.DATE, 
            field: 'dataCriacao',
            allowNull: true  
        }
    },{ tableName: 'Configuracao' }
);

var TarefaConcluida = sequelize.define('tarefaConcluida', {
        tarefaConcluidaId: { 
            type: Sequelize.INTEGER, 
            field: 'tarefaConcluidaId', 
            allowNull: false, 
            primaryKey: true, 
            autoIncrement: true 
        },
        configuracaoId: { 
            type: Sequelize.INTEGER, 
            field: 'configuracaoId',
            allowNull: false  
        },
        dataConclusao: { 
            type: Sequelize.DATE, 
            field: 'dataConclusao',
            allowNull: true  
        },
        dataCriacao: { 
            type: Sequelize.DATE, 
            field: 'dataCriacao',
            allowNull: false  
        },
        dataAtualizacao: { 
            type: Sequelize.DATE, 
            field: 'dataAtualizacao',
            allowNull: true 
        }
    },{ tableName: 'TarefaConcluida' }
);

Configuracao.belongsTo(Titulo, { foreignKey: 'TituloId' });
Configuracao.belongsTo(Recorrencia, { foreignKey: 'RecorrenciaId' });

// routes ==================================================
app.get('/api/obterConfiguracoes', function (req, res)  {

    var query = " SELECT * FROM hjqoto3qzd8dzwaw.Configuracao ";

    //console.log(query);

    connection.query(query, function(err, rows, fields) {
        if (err) {
            console.log('Erro na query: ' + err);
            connection.end();
        } else {
            console.log('******CONFIGS');
            console.log(rows);
            res.json({ sucesso: true, mensagem: "Configuracoes obtidas", objeto: { tarefasDeHoje: rows } });
        }
    });
});

app.post('/api/obterTarefas', function (req, res) {

    var rDia = req.body.dia;
	var pDia = new Date(rDia);
	
	var tarefas = [];
	var tarefasIds = [];
	var tarefasConcluidas = [];
	var tarefasMerge = [];
	
	async.series([
		function configuracaoFn (callback) {

			Configuracao
				.findAll({ include: [ Titulo, Recorrencia ] })
				.then( function (configs) {
					
					var diaAno = pDia.getFullYear();
					var diaMes = pDia.getMonth() + 1;
					var diaDia = pDia.getDate();
					var diaDiaDeSemana = pDia.getDay();

					var select = "val,i=>{ data: '" + diaAno + "-" + diaMes + "-" + diaDia + "', " + 
					" configuracaoId: val.configuracaoId, " + 
					" descricao: val.titulo.descricao, " + 
					" recorrencia: val.recorrencium.descricao, " + 
					" Index: i }";

					var tarefasEnum = Enumerable.from(configs)
						.where(function (x) {
							var ta = x.inicioGet.getFullYear();
							var tm = x.inicioGet.getMonth() + 1;
							var td = x.inicioGet.getDate();
							var ts = x.inicioGet.getDay();
							var dataDaTarefaEhExatamenteHoje = diaAno == ta && diaMes == tm && diaDia == td;
							var tarefaJaIniciou = x.inicioGet <= pDia;
							var mesmoDiaDaSemana = ts == diaDiaDeSemana;
							var diaDoMesEhIgualHoje = td == diaDia;
							var tarefasLambda =
								(x.RecorrenciaId == 1 && dataDaTarefaEhExatamenteHoje) ||
								(x.RecorrenciaId == 2 && tarefaJaIniciou) ||
								(x.RecorrenciaId == 3 && tarefaJaIniciou && mesmoDiaDaSemana) ||
								(x.RecorrenciaId == 4 && tarefaJaIniciou && diaDoMesEhIgualHoje);
								
							return tarefasLambda; 
						});
					tarefas    = tarefasEnum.select(select).toArray();
					tarefasIds = tarefasEnum.select(function(value, index) { return value.configuracaoId; }).toArray();
										
					callback();
				});
		},
		function tarefasConcluidasFn (callback) {

			TarefaConcluida
				.findAll( { where: 
								sequelize.where(sequelize.fn('date', sequelize.col('DataConclusao')), formatarYYYYMMDD(pDia)),
								configuracaoId: { $in: tarefasIds } }  )
				.then( function (tcs) {

					//console.log('------------tcs-------------');
					//console.log(JSON.stringify(tcs));
					//console.log('');
					
					tarefasConcluidas = tcs;
					
					callback();
				});
		},
		function mergeFn (callback) {

			//console.log('...... tarefas');
			//console.log(JSON.stringify(tarefas));
			//console.log('...... tarefasConcluidas');
			//console.log(JSON.stringify(tarefasConcluidas));
			//console.log('');

			for(i = 0; i < tarefas.length; i++) {

				var mConcluida = true;
				//console.log('PRIMEIRO FOR');
				//console.log('tarefas[i].configuracaoId');
				//console.log(tarefas[i].configuracaoId);

				if (tarefasConcluidas.length == 0) {
					tarefas[i].concluida = false;	
				}
				else if (tarefasConcluidas.length > 0) {

                    var esta = helpList(tarefas[i], tarefasConcluidas);
                    tarefas[i].concluida = esta;



					/*for(j = 0; j < tarefasConcluidas.length; j++) {

						console.log('    SEGUNDO FOR');
						console.log('    tarefasConcluidas[i].configuracaoId');
						console.log('    ' + tarefasConcluidas[j].configuracaoId);

						var condicao = tarefas[i].configuracaoId === tarefasConcluidas[j].configuracaoId;

						//TODO: consertar bug quando seta conclusao de tarefa

						if (condicao ==  false) {
							console.log('    configuracaoIds nao eh igual');
							mConcluida = mConcluida && false;
						}
					}
					console.log('    **** tarefa configuracaoId #' + tarefas[i].configuracaoId + ', conclusao é ' + mConcluida);
					tarefas[i].concluida = mConcluida;*/
				}
			}
					
			callback();
		}
	], function(err) { 
		if (err != null) return res.status(500).send(err);

		console.log('RESPONSE: tarefas obtidas');
		console.log(JSON.stringify(tarefas));
		console.log('.');
			
        res.json({ success: true, message: 'tarefas obtidas', objeto: { tarefas: tarefas }});
    });
});

app.get('/api/obterTitulos', function (req, res) {

    Titulo
        .findAll()
        .then( function obterRecorrenciasNew (tits) {
            res.json({ sucesso: true, mensagem: "Titulos obtidos", objeto: { titulos: tits } });
        });
});

app.get('/api/obterRecorrencias', function (req, res) {

    Recorrencia
        .findAll()
        .then( function obterRecorrenciasNew (recs) {
            res.json({ sucesso: true, mensagem: "Recorrencias obtidas new", objeto: { recorrencias: recs } });
        });
});

app.get('/api/obterTitulosTarefas', function (req, res) {
    console.log('obterTitulosTarefas');

    TituloTarefaModel.find(function (err, data) {
        if (err) res.send(err);

        res.json({ sucesso: true, mensagem: "Tarefas obtidas", objeto: { titulosTarefas: data } });
    });
});

app.post('/api/concluirTarefa', function (req, res) {

	console.log(req.body);

	var mConfiguracaoId = req.body.configuracaoId;
    var mData = req.body.data;
    var mConcluir = req.body.concluir;
	//TODO: Corrigir bug de timezone. Criar trigger global no banco

    if (mConcluir == true) {
    	TarefaConcluida.create({ 
    		configuracaoId: mConfiguracaoId, 
    		dataConclusao: new Date(mData),
    		dataCriacao: new Date()
    	}).then(function(tarefaConcluida) {
    		console.log('Tarefa concluida');
    		console.log(JSON.stringify(tarefaConcluida));
            console.log('');
    	});
    } else if (mConcluir == false) {
        TarefaConcluida.update({ 
            dataConclusao: null,
            dataAtualizacao: new Date()
        }, { 
            where: {
                configuracaoId: mConfiguracaoId,
                dataConclusao: new Date(mData)
        }
        }).then(function(tarefaConcluida) {
            console.log('Conclusao de tarefa atualizada ');
            console.log(JSON.stringify(tarefaConcluida));
            console.log('');
        });        
    }
});

app.post('/api/gravarNovaConfiguracao', function (req, res) {

    var tituloId = req.body.titulo;
    var recorrenciaId = req.body.recorrencia;
    var inicioId = req.body.inicio;
    var inicio = '';

    var ano = new Date().getFullYear();

    var mes = new Date().getMonth();
    mes = mes + 1;
    var mesStr = "" + mes;
    var pad = "00";
    mes = pad.substring(0, pad.length - mesStr.length) + mesStr;

    var dia = new Date().getDate();
    if (inicioId == 2) {
        dia = dia + 1;
    } else if (inicioId == 3) {
        dia = dia + 2;
    }
    var diaStr = "" + dia;
    var pad = "00";
    dia = pad.substring(0, pad.length - diaStr.length) + diaStr;

    if (inicioId != null) {
        if (inicioId < 1 || inicio > 3) {
            res.json({ sucesso: false, mensagem: "Inicio invalido", objeto: { } });
            return;
        }
        inicio = "'" + ano + "-" + mes + "-" + dia + "'";
    }

    var query = " INSERT INTO `hjqoto3qzd8dzwaw`.`Configuracao` " +
                "        (      `TituloId`,      `RecorrenciaId`,       `InicioSet`, `Ativo`, `DataCriacao` ) " +
                " VALUES (" + tituloId + "," + recorrenciaId + ", " + inicio + ",       1,         NOW() ); ";

    connection.query(query, function(err, rows, fields) {
        if (err) {
            console.log('Erro na query: ' + err);
            connection.end();
        } else {
            res.json({ sucesso: true, mensagem: "Config de tarefa inserida ok", objeto: { } });
        }
    });
});

// HELPERS
app.get('/api/deletarTarefasConcluidas', function (req, res) {

    TarefaConcluida
        .destroy({ where: { }, force: true })
        .then( function deletarTarefasConcluidasFn () {
            res.json({ sucesso: true, mensagem: "TarefaConcluida deletadas fn ", objeto: { } });
        });
});

app.get('/api/obterTarefasConcluidas', function (req, res) {

    TarefaConcluida
        .findAll()
        .then( function obterTarefasConcluidasFn (pTcs) {
            res.json({ sucesso: true, mensagem: "TarefaConcluida obtidas fn ", objeto: { tcs: pTcs } });
        });
});

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


// listen (start app with node server.js) ======================================
app.listen(8082);
console.log("tcapp na porta 8082");
