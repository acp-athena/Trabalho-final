import session from 'express-session';
import express from 'express';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';
import path from 'path';

const app = express();
const porta = 3000;

var listaInteressados = [];
var listarPet = [];

const addAdocao = [];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const diretorioPublic = path.join(__dirname, 'public');
app.use(express.static(diretorioPublic));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
  secret: "Ch4v3",
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 30
  }
}));

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(diretorioPublic, 'login.html'));
});

app.post('/login', (req, res) => {
    const user = req.body.usuario;
    const password = req.body.password;
  
    console.log('Usuário:', user);
    console.log('Senha:', password);
  
    if (user === 'Ana' && password === 'abc123') {
      req.session.usuarioAutenticado = true;
      res.redirect('/');
    } else {
      res.end(`
        <!DOCTYPE html>
        <head>
            <meta charset="UTF-8">
            <title>Falha ao fazer login</title>
            <link rel="stylesheet" type="text/css" href="login.css">
        </head>
        <body>
            <h1>Usuário ou senha inválido!</h1>
            <a href="/login.html">Voltar a página de login</a>
        </body>
     </html>
      `);
    }
});

function autenticar(req, res, next) {
    if (req.session && req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect('/login.html');
    }
}
app.post('/logout', (req, res) => {
    req.session.usuarioAutenticado = false;
    res.sendStatus(200);
});
app.get('/', autenticar, (req, res) => {
    const data = new Date();
    const dataFormatada = data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    res.cookie("DataUltimoAcesso", dataFormatada, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true
    });
    res.end(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Menu de Adoçao</title>
            <link rel="stylesheet" href="home.css">
        </head>
        <body>
            <header>
                <h1>MENU</h1>
            </header>
            <nav>
                <ul>
                    <li><a href="/adotante.html">Cadastrar Adotante</a></li>
                    <li><a href="/pet.html">Cadastrar Pet</a></li>
                    <li><a href="/adocao.html">Adotar um Pet</a></li>
                </ul>

                <div id="logoutReturnBtn">
                    <button id="logoutBtn">Logout</button>
                </div>
            </nav>
            <footer>
                <p> Seu último acesso foi em ${dataFormatada}</p>
            </footer>
        </body>
        </html>
    `);
});

function processaCadastroUsuario(req, res) {
    const dados = req.body; 
    let htmlResposta = ``;
    if (!(dados.nome && dados.email && dados.telefone)) {
        htmlResposta = `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Interessados</title>
                <link rel="stylesheet" href="cadastro.css">
            </head>
            <body>
                <div class="container">
                  <form action='/cadastrar' method='POST' class="cadastro-form">
                        <legend class="mb-3">Cadastro de Interessados</legend>
                        <div class="form-group">
                            <label for="nome">Nome</label>
                            <input type="text" id="nome" name="nome" value ="${dados.nome}" required>
                        </div>
            `;
        if (!dados.nome) {
            htmlResposta += `
                                        <div>
                                            <p class = "text-danger">Por favor, informe o nome!</p>
                                        </div>
                `;
        }
        htmlResposta += `
                <div class="form-group">
                    <label for="email">E-mail</label>
                    <input type="email" id="email" name="email" value="${dados.email}"required>
                </div>  
                `;
        if (!dados.email) {
            htmlResposta += `
                <div>
                    <p class = "text-danger">Por favor, informe o E-mail!</p>
                </div>
                `;
        }
        htmlResposta += `
                 <div class="form-group">
                    <label for="telefone">Telefone</label>
                    <input type="tel" id="telefone" name="telefone" value="${dados.telefone}"required>
                </div>
               `;
        if (!dados.telefone) {
            htmlResposta += `
            <div>
            <p class = "text-danger">Por favor, informe Um numero de telefone!</p>
            </div>`;
        }
        htmlResposta += `
        <div class="form-group">
            <button type="submit">Cadastrar</button>
            <a href="/menu.html" class="return-button">Retornar ao Menu</a>
        </div>
  </form>
  </div>  
  </body>
  </html>`;
        res.end(htmlResposta);
    }
    else {
        const usuario = {
            nome: dados.nome,
            email: dados.email,
            telefone: dados.telefone,
  
        }
        listaInteressados.push(usuario);
        htmlResposta = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Cadastro de Interessados</title>
        <link rel="stylesheet" href="listagem.css">
        </head>
    <body>
        <h1>Lista de interessados cadastrados</h1>
        <table class="table table-striped table-hover">
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Telefone</th>
                </tr>
            </thead>
            <tbody>`;
        for (const usuario of listaInteressados) {
            htmlResposta += `
                    <tr>
                        <td>${usuario.nome}</td>
                        <td>${usuario.email}</td>
                        <td>${usuario.telefone}</td>
                    </tr>
                `;
        }
        htmlResposta += `
                </tbody>
            </table>
            <button class="buttons menu-button"><a href="/" role="button">Retornar ao Menu</a></button>
            <br>
            <button class="buttons menu-button"><a href="/adotante.html" role="button">Continuar cadastrando</a></button>
        </body>
     </html>`;
        res.end(htmlResposta);
    }
}

function processaCadastroPet(req, res) {
    const dados = req.body;
    let htmlResposta = ``;
    if (!(dados.nomePet && dados.racaPet && dados.idadePet)) {
        htmlResposta = `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Pets</title>
                <link rel="stylesheet" href="cadastro.css">
            </head>
            <body>
                <div class="container">
                    <form action='/cadastrarPet' method='POST' class="cadastro-form">
                            <legend class="mb-3">Cadastro de Pets</legend>
                            <div class="form-group">
                                <label for="nomePet">Nome do Pet</label>
                                <input type="text" id="nomePet" name="nomePet" value ="${dados.nomePet}" required>
                            </div>
            `;
        if (!dados.nomePet) {
            htmlResposta += `
                                        <div>
                                            <p class = "text-danger">Por favor, informe o nome do pet!</p>
                                        </div>
                `;
        }
        htmlResposta += `
                <div class="form-group">
                    <label for="racaPet">Raça</label>
                    <input type="text" id="racaPet" name="racaPet" value="${dados.racaPet}" required>
                </div> 
                `;
        if (!dados.racaPet) {
            htmlResposta += `
                <div>
                    <p class = "text-danger">Por favor, informe a Raça do Pet!</p>
                </div>
                `;
        }
        htmlResposta += `
                <div class="form-group">
                    <label for="idadePet">Idade (anos)</label>
                    <input type="number" id="idadePet" name="idadePet" value="${dados.idadePet}" required>
                </div>
               `;
        if (!dados.idadePet) {
            htmlResposta += `
            <div>
                <p class = "text-danger">Por favor, informe a idade do Pet!</p>
            </div>`;
        }
        htmlResposta += `
        <div class="form-group">
            <button type="submit">Cadastrar Pet</button>
            <a href="/menu.html" class="return-button">Retornar ao Menu</a>
        </div>
  </form>
  </div>  
  </body>
  </html>`;
        res.end(htmlResposta);
    }
    else {
        const pet = {
            nomePet: dados.nomePet,
            racaPet: dados.racaPet,
            idadePet: dados.idadePet
        }
        listarPet.push(pet);
        htmlResposta = `
    <!DOCTYPE html>
    <html lang="pt-br">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Lista de Pets</title>
        <link rel="stylesheet" href="listagem.css">
    </head>
        <h1>Lista de Pets cadastrados</h1>
        <table class="form-group">
            <thead>
                <tr>
                    <th>Nome do Pet</th>
                    <th>Raça do Pet</th>
                    <th>Idade do Pet</th>
                </tr>
            </thead>
            <tbody>`;
        for (const pet of listarPet) {
            htmlResposta += `
                    <tr>
                        <td>${pet.nomePet}</td>
                        <td>${pet.racaPet}</td>
                        <td>${pet.idadePet}</td>
                    </tr>
                `;
        }
        htmlResposta += `
                </tbody>
            </table>
            <button class="buttons menu-button"><a href="/" role="button">Retornar ao Menu</a></button>
            <br>
            <button class="buttons menu-button"><a href="/pet.html" role="button">Continuar cadastrando pet</a></button>
        </body>
     </html>`;
        res.end(htmlResposta);
    }
}

app.post('/addAdocao', (req, res) => {
    const dadosForm = req.body;
    const data = new Date();
    const opcao = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const dataFormatada = data.toLocaleDateString('pt-BR', opcao);
    const novoDesejo = {
        interessado: dadosForm.interessado,
        pet: dadosForm.pet,
        data: dataFormatada
    };
    addAdocao.push(novoDesejo);
    res.redirect('/adocao.html');
});
app.get('/listaInteressados', autenticar, (req, res) => {
    res.json(listaInteressados);
});
app.get('/listarPet', autenticar, (req, res) => {
    res.json(listarPet);
});
app.get('/addAdocao', autenticar, (req, res) => {
    res.json(addAdocao);
});

app.post('/cadastrar', autenticar, processaCadastroUsuario);
app.post('/cadastrarPet', autenticar, processaCadastroPet);
app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});