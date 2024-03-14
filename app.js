const express = require('express');
const path = require('path');
const app = express();

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
   res.sendFile(path.join(__dirname, 'pages/cadastro/cadastro.html'));
});

app.get('/login', (req, res) => {
   res.sendFile(path.join(__dirname, 'pages/Login/login.html'));
});

// Rota para processar o cadastro
app.post('/cadastro', (req, res) => {
   const { email, password } = req.body;

    // Lógica de validação do cadastro aqui...
    // Simulação de validação bem-sucedida
    if (email === 'test@example.com' && password === '123456') {
        console.log('Cadastro validado com sucesso.');
        // Se tudo estiver válido, redirecione para a página de login
        res.redirect('/login');
    } else {
        // Simulação de falha na validação
        console.log('Erro de validação do cadastro.');
        res.status(400).send('Erro de validação do cadastro.');
    }
});

// Iniciar o servidor
app.listen(8081, function() {
    console.log("Servidor Rodando na url http://localhost:8081");
});
