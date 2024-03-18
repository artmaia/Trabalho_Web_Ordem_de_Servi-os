const express = require('express');
const path = require('path');
const app = express();

//modulo mysql
const mysql = require('mysql2');

app.use(express.json());
app.use(express.urlencoded({extended:false}));

//configuração do banco de dados
const conexao = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'1722',
    database:'crud'
});

// teste de conexao
conexao.connect(function(erro){
    if(erro) throw erro;
    console.log('Conexao bem sucedida');
})

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'pages/cadastro/cadastro.html'));
});

app.get('/login', (req, res) => {
   res.sendFile(path.join(__dirname, 'pages/Login/login.html'));
});

app.get('/usuario', (req, res) => {
   res.sendFile(path.join(__dirname, 'pages/Usuario/Usuario.html'));
})

app.post('/solicitar_servico', (req, res) => {
    try {
        let hora = req.body.hora;
        let data = req.body.data;
        let descricao = req.body.descricao;
        let categoria = req.body.categoria;

        // Verifica se todos os campos foram preenchidos
        if (!hora || !data || !descricao || !categoria) {
            res.redirect('/falhaCadastro');
            return;
        }

        // Monta a query SQL para inserir os dados na tabela "servico"
        let sql = `INSERT INTO servico (hora, data, descricao, categoria) VALUES (?, ?, ?, ?)`;
        let values = [hora, data, descricao, categoria];

        // Executa a query no banco de dados
        conexao.query(sql, values, (error, resultado) => {
            if (error) {
                console.error('Erro ao cadastrar serviço:', error);
                res.redirect('/erroCadastro');
                return;
            }

            console.log('Serviço cadastrado com sucesso!');
            res.redirect('/okCadastro');
        });
    } catch (erro) {
        console.error('Erro ao processar requisição:', erro);
        res.redirect('/erroCadastro');
    }
});
// Iniciar o servidor
app.listen(8081, function() {
    console.log("Servidor Rodando na url http://localhost:8081");
});
