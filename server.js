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
function obterAno(anoStr){
    return anoStr.substring(0,4);
}
function obterMes(anoStr){
    return anoStr.substring(5,7);
}
function obterDia(anoStr){
    return anoStr.substring(8,10);
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
            allowNull: false  
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

    var pDia = req.body.dia;

    Configuracao
        .findAll({ include: [ Titulo, Recorrencia ] })
        .then( function (configs) {

            var dia = new Date(pDia);
            var diaAno = dia.getFullYear();
            var diaMes = dia.getMonth() + 1;
            var diaDia = dia.getDate();
            var diaDiaDeSemana = dia.getDay();

            var tarefas = Enumerable.from(configs)
                .where(function (x) {
					
					console.log('****************');
					console.log('JSON.stringify(x)');
					console.log(JSON.stringify(x));
					console.log('****************');
					console.log('');
					
                    var ta = x.inicioGet.getFullYear();
                    var tm = x.inicioGet.getMonth() + 1;
                    var td = x.inicioGet.getDate();
                    var ts = x.inicioGet.getDay();

                    var dataDaTarefaEhExatamenteHoje = diaAno == ta && diaMes == tm && diaDia == td;
                    var tarefaJaIniciou = x.inicioGet <= dia;
                    var mesmoDiaDaSemana = ts == diaDiaDeSemana;
                    var diaDoMesEhIgualHoje = td == diaDia;

                    var tarefass =
                        (x.RecorrenciaId == 1 && dataDaTarefaEhExatamenteHoje) ||
                        (x.RecorrenciaId == 2 && tarefaJaIniciou) ||
                        (x.RecorrenciaId == 3 && tarefaJaIniciou && mesmoDiaDaSemana) ||
                        (x.RecorrenciaId == 4 && tarefaJaIniciou && diaDoMesEhIgualHoje);

                    return tarefass; 

                })
                .select("val,i=>{ configuracaoId: val.configuracaoId, descricao: val.titulo.descricao, recorrencia: val.recorrencium.descricao, Index:i, tudo: val }")
                .toArray();
            
            res.json({ sucesso: true, mensagem: "ok", objeto: { tarefas: tarefas } });
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
    console.log('concluirTarefa');

    var configuracaoId = req.body.ConfigId;

    var query = " INSERT INTO `hjqoto3qzd8dzwaw`.`TarefaConcluida` " +
                "        (      `ConfiguracaoId`, `DataConclusao`)  " +
                " VALUES (" + configuracaoId + ",          NOW() ); ";

    connection.query(query, function(err, rows, fields) {
        if (err) {
            console.log('Erro na query: ' + err);
            connection.end();
        } else {
            console.log(rows);
            res.json({ sucesso: true, mensagem: "Tarefa concluida", objeto: { } });
        }
    });
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

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


// listen (start app with node server.js) ======================================
app.listen(8082);
console.log("tcapp na porta 8082");
