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
    password:'1234',
    database:'TrabalhoWeb'
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

app.post('/cadastro', (req, res) => {
    const { email, password } = req.body;

    // Inserir novo usuário no banco de dados
    conexao.query('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, password], (err, results) => {
        if (err) {
            console.error('Erro ao inserir novo usuário:', err);
            res.status(500).send('Erro ao processar o cadastro.');
            return;
        }
        console.log('Novo usuário cadastrado com sucesso.');
        res.redirect('/login');
    });
});

app.post('/login', function(req, res) {
    const { email, password } = req.body;
  
    conexao.query('SELECT * FROM usuarios WHERE email = ? AND senha = ?', [email, password], function(error, results, fields) {
      if (error) throw error;
      
      if (results.length > 0) {
        res.redirect('/usuario')
      } else {
        res.send('Credenciais inválidas.');
      }
      res.end();
    });
 });

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
