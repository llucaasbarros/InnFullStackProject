//CONFIGURAÇÃO

const sql = require("mssql");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
require("dotenv").config();

const app = express();
const cors = require("cors");
const port = 3000;
app.use(cors());
app.use(express.json());

const config = {
  server: "localhost",
  database: /*database SQL SERVER*/,
  port: 1433,
  user: /*usuario*/,
  password: /*senha*/,
  trustServerCertificate: true,
  options: {
    encrypt: false,
  },
};

sql
  .connect(config)
  .then((conn) => {
    console.log("Conectou");
    global.conn = conn;
  })
  .catch((err) => {
    console.log(err);
  });

function execSQLQuery(sqlQry, res) {
  global.conn
    .request()
    .query(sqlQry)
    .then((result) => res.json(result.recordset)) // Em caso de sucesso
    .catch((err) => console.log(err)); // Em caso de erro
}

function verificarToken(req, res, next) {
  const token = req.headers["authorization"].split("Bearer")[1].trim();

  if (!token) {
    return res.status(403).send("Um token é necessário para a autenticação");
  }

  try {
    // Decodifica o token
    const decoded = jwt.verify(token, "123");
    req.id_usuario = decoded.id_usuario;
  } catch (err) {
    return res.status(401).send("Token inválido");
  }

  return next();
}

//APP LISTENS:

app.listen(port, () => {
  console.log(`Rodando na porta ${port}`);
});

//GETS:

app.get("/reserva", verificarToken, (req, res) => {
  execSQLQuery(
    "SELECT * FROM reserva where id_usuario = " + req.id_usuario,
    res
  );
});

app.get("/quarto", (req, res) => {
  execSQLQuery("SELECT * FROM quarto", res);
});

app.get("/cadastro", (req, res) => {
  try {
    execSQLQuery(`SELECT * FROM usuario`, res);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

//POSTS:

app.post("/reserva", verificarToken, (req, res) => {
  const id_usuario = parseInt(req.id_usuario);
  const id_quarto = parseInt(req.body.id_quarto);
  const DataEntrada = req.body.DataEntrada;
  const DataSaida = req.body.DataSaida;
  const NumeroPessoas = parseInt(req.body.NumeroPessoas);

  execSQLQuery(
    `INSERT INTO reserva(id_usuario, id_quarto, DataEntrada, DataSaida, NumeroPessoas) VALUES (${id_usuario}, ${id_quarto}, '${DataEntrada}', '${DataSaida}', ${NumeroPessoas})`,
    res
  );
  res.json({
    id_usuario,
    ...req.body,
  });
});

app.post("/cadastro", async (req, res) => {
  try {
    const { nome, CPF, DataNascimento, Endereco, email, senha } = req.body;

    const cpfNumerico = CPF.replace(/\D/g, "");

    if (cpfNumerico.length !== 11 || isNaN(parseInt(cpfNumerico))) {
      return res
        .status(400)
        .send("CPF inválido. Deve conter exatamente 11 dígitos numéricos.");
    }
    const senhaHash = await bcrypt.hash(senha.toString(), 10);
    const query = `INSERT INTO usuario (Nome, CPF, DataNascimento, Endereco, Email, Senha) VALUES ('${nome}', '${cpfNumerico}', '${DataNascimento}', '${Endereco}', '${email}', '${senhaHash}')`;
    delete req.body.senha;
    global.conn
      .request()
      .query(query)
      .then(() => res.json(req.body))
      .catch((err) => res.status(500).send(err));
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { cpf, senha } = req.body;

    if (!cpf.toString().match(/^\d{11}$/)) {
      return res
        .status(400)
        .send("CPF inválido. Deve conter 11 dígitos numéricos.");
    }

    const query = `SELECT * FROM usuario WHERE CPF = '${cpf}'`;
    const result = await global.conn.request().query(query);

    if (result.recordset.length > 0) {
      const usuario = result.recordset[0];
      const validPassword = await bcrypt.compare(senha, usuario.Senha);

      if (validPassword) {
        const token = jwt.sign(
          { id_usuario: usuario.id_usuario },
          "123",
          { expiresIn: "1h" }
        );
        res.json({ token });
      } else {
        res.status(400).send("Senha incorreta");
      }
    } else {
      res.status(400).send("Usuário não encontrado");
    }
    console.log(process.env.JWT_SECRET)
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro no servidor");
  }
});

app.post("/quarto", async (req, res) => {
  const Tipo = req.body.Tipo;
  const Descricao = req.body.Descricao;
  const Preco = parseFloat(req.body.Preco);

  const query = `INSERT INTO quarto (Tipo, Descricao, Preco) VALUES ('${Tipo}', '${Descricao}', ${Preco})`;

  try {
    await global.conn.request().query(query);

    const result = await global.conn
      .request()
      .query("SELECT TOP 1 * FROM quarto ORDER BY id_quarto DESC");

    res.json(result.recordset[0]);
  } catch (error) {
    res.status(500).send(error);
  }
});

//DELETES:

app.delete("/login/:id", (req, res) => {
  execSQLQuery(
    "DELETE FROM usuario WHERE id_usuario=" + parseInt(req.params.id),
    res
  );
});

app.delete("/quarto/:id", (req, res) => {
  execSQLQuery(
    "DELETE FROM quarto WHERE id_quarto=" + parseInt(req.params.id),
    res
  );
  res.sendStatus(200);
});

app.delete("/reserva/:id", (req, res) => {
  execSQLQuery(
    "DELETE FROM reserva WHERE id_reserva=" + parseInt(req.params.id),
    res
  );
});

//PUTS:

app.put("/quarto/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const Tipo = req.body.Tipo;
  const Descricao = req.body.Descricao;
  const Preco = req.body.Preco;
  execSQLQuery(
    `UPDATE quarto SET Tipo='${Tipo}', Descricao='${Descricao}', Preco=${Preco} WHERE id_quarto=${id}`,
    res
  );
  res.json(req.body);
});

app.put("/login/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const Nome = req.body.Nome;
  const CPF = req.body.CPF;
  const DataNascimento = req.body.DataNascimento;
  const Endereco = req.body.Endereco;
  const Email = req.body.Email;
  const Senha = req.body.Senha;
  execSQLQuery(
    `UPDATE usuario SET Nome='${Nome}', CPF='${CPF}', DataNascimento='${DataNascimento}', Endereco='${Endereco}', Email='${Email}', Senha='${Senha}' WHERE id_usuario=${id}`,
    res
  );
});

app.put("/reserva/:id", verificarToken, (req, res) => {
  const id = parseInt(req.params.id);
  const DataEntrada = req.body.DataEntrada;
  const DataSaida = req.body.DataSaida;
  const NumeroPessoa = req.body.NumeroPessoas;
  execSQLQuery(
    `UPDATE reserva SET DataEntrada='${DataEntrada}', DataSaida='${DataSaida}', NumeroPessoas=${NumeroPessoa} WHERE id_reserva=${id}`,
    res
  );
  res.json({
    id_usuario: req.id_usuario,
    ...req.body,
  });
});

//GETS BY ID:

app.get("/quarto/:id", (req, res) => {
  let filter = "";

  if (req.params.id) {
    filter = " WHERE id_quarto=" + parseInt(req.params.id);
  }

  execSQLQuery("SELECT * FROM quarto" + filter, res);
});

app.get("/reserva/:id", (req, res) => {
  let filter = "";

  if (req.params.id) {
    filter = " WHERE id_reserva=" + parseInt(req.params.id);
  }

  execSQLQuery("SELECT * FROM reserva" + filter, res);
});

app.get("/login/:id", (req, res) => {
  let filter = "";

  if (req.params.id) {
    filter = " WHERE id_usuario=" + parseInt(req.params.id);
  }

  execSQLQuery("SELECT * FROM usuario" + filter, res);
});