// server.js
// set up ========================
var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var async = require('async');
var Sequelize = require('sequelize');


// configuration =================
app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ 'extended': 'true' }));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
app.use(methodOverride());
var connStr = 'mysql://y51n036oz366vj1q:f56ttmh72xf3vei2@z37udk8g6jiaqcbx.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306/hjqoto3qzd8dzwaw';


//ORM
var sequelize = new Sequelize(connStr, {
  define: {
    timestamps: false
  }
});

var Recorrencia = sequelize.define('Recorrencia', {
    recorrenciaId: { 
        type: Sequelize.INTEGER, 
        field: 'RecorrenciaId', 
        allowNull: false, 
        primaryKey: true, 
        autoIncrement: true 
    },
    descricao: { 
        type: Sequelize.STRING, 
        field: 'Descricao',
        allowNull: false,  }
    }
);

app.get('/api/obterRecorrencias2', function (req, res) {
    
    console.log('alo');
    
    Recorrencia
        .findAll()
        .then( function obtendoTudo(recorrencia) {            

            // for(i = 0; i < recorrencia.length; i++){
            //     console.log('recorrencia[i].recorrenciaId');
            //     console.log(recorrencia[i].recorrenciaId);
            //     console.log('');

            //     console.log('recorrencia[i].descricao');
            //     console.log(recorrencia[i].descricao);
            //     console.log('');
            // }

        });
});

// listen (start app with node server.js) ======================================
app.listen(8082);
console.log("tcapp na porta 8082");
