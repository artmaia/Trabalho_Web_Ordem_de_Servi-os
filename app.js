const express = require('express')
const path = require('path')
const app = express()

//CSS
app.use(express.static(path.join(__dirname, 'public')));


//Rotas das páginas
app.get('/', (req, res)=>{
   res.sendFile(path.join(__dirname, 'pages/cadastro/cadastro.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages/Login/login.html'));
 });
app.get('/usuario', (req, res) => {
   res.sendFile(path.join(__dirname, 'pages/Usuario/usuario.html'));
});



//servidor
app.listen(8081, function() {
    console.log("Servidor Rodando na url http://localhost:8081");
})