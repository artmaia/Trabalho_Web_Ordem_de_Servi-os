const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();


// Configure o middleware de sessão
app.use(session({
    secret: 'secreto', // Use uma chave secreta para assinar a sessão
    resave: false,
    saveUninitialized: false
}));

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
});

app.get('/administrador', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/Admin/administrador.html'));
});

//cadastro
app.post('/cadastro', (req, res) => {
    const { email, password } = req.body;

    // Verifica se o email já existe no banco de dados
    conexao.query('SELECT * FROM banco_usuarios WHERE email = ?', [email], (err, results) => {
        if (err) {
            console.error('Erro ao verificar email:', err);
            res.status(500).send('Erro ao processar o cadastro.');
            return;
        }
        
        // Se o email já existir, retorna uma mensagem de erro
        if (results.length > 0) {
            console.log('Email já cadastrado:', email);
            res.status(400).send('Este email já está cadastrado.');
            return;
        }

        // Se o email não existir, insere o novo usuário no banco de dados
        conexao.query('INSERT INTO banco_usuarios (email, senha) VALUES (?, ?)', [email, password], (err, results) => {
            if (err) {
                console.error('Erro ao inserir novo usuário:', err);
                res.status(500).send('Erro ao processar o cadastro.');
                return;
            }
            console.log('Novo usuário cadastrado com sucesso.');
            res.redirect('/login');
        });
    });
});

//login
app.post('/login', function(req, res) {
    const { email, password } = req.body;
  
    conexao.query('SELECT * FROM banco_usuarios WHERE email = ? AND senha = ?', [email, password], function(error, results, fields) {
        if (error) {
            console.error('Erro ao verificar credenciais:', error);
            res.status(500).send('Erro ao processar o login.');
            return;
        }
        
        if (results.length > 0) {
            const usuario_id = results[0].id;
            // Armazenar o ID do usuário na sessão
            req.session.usuario_id = usuario_id;
            res.redirect('/usuario');
        } else {
            res.send('Credenciais inválidas.');
        }
    });
});

//solicitação de serviços
app.post('/solicitar_servico', (req, res) => {
    try {
        // Recuperar o ID do usuário da sessão
        const usuario_id = req.session.usuario_id;
        let hora = req.body.hora;
        let data = req.body.data;
        let descricao = req.body.descricao;
        let categoria = req.body.categoria;

        // Verifica se todos os campos foram preenchidos
        if (!usuario_id || !hora || !data || !descricao || !categoria) {
            res.redirect('/falhaCadastro');
            return;
        }

        // Monta a query SQL para inserir os dados na tabela "servico"
        let sql = `INSERT INTO servico (usuario_id, hora, data, descricao, categoria) VALUES (?, ?, ?, ?, ?)`;
        let values = [usuario_id, hora, data, descricao, categoria];

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


//Consulta tabela
app.get('/dados_solicitacao', (req, res) => {
    // Recuperar o ID do usuário da sessão
    const usuario_id = req.session.usuario_id;

    // Consulta SQL para selecionar as solicitações do usuário logado
    const sql = 'SELECT usuario_id, hora, data, descricao, categoria FROM servico WHERE usuario_id = ?';
  
    // Executa a consulta SQL com o ID do usuário como parâmetro
    conexao.query(sql, [usuario_id], (err, results) => {
        if (err) {
            // Em caso de erro, envia uma resposta de erro para o cliente
            res.status(500).send('Erro ao buscar dados do banco de dados');
            return;
        }
  
        // Se a consulta for bem-sucedida, envia os resultados para o cliente
        res.json(results);
    });
});

// Iniciar o servidor
app.listen(8081, function() {
    console.log("Servidor Rodando na url http://localhost:8081");
});
