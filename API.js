import express from "express";
import pg from "pg";
import cors from "cors";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

const db = new pg.Client({
    connectionString: process.env.PG_URL,
});
db.connect();

app.use(cors());

app.get("/", async (req, res) => {
    const result = await db.query(
        "SELECT * FROM mensalidadesudv ORDER BY nomesocio DESC"
    );
    const data = result.rows;

    res.json(data);
});

app.get("/filter", async (req, res) => {
    const situacaoQuery = req.query.situacao;
    const socioQuery = req.query.nomesocio;
    const grauQuery = req.query.grau;

    const queries = req.query;
    console.log(queries);

    const entries = Object.entries(queries);
    console.log(entries);

    const textoDb = [];

    for (let [key, value] of entries) {
        if (value === "Todos") {
            value = "''";
        }
        if (value.trim() !== "''") {
            textoDb.push(`${key} = '${value}'`);
        }
    }

    let textoDbPronto = `${textoDb.length > 0 ? "WHERE" : ""} ${textoDb.join(
        " AND "
    )}`;
    console.log(textoDbPronto);

    const result = await db.query(
        `SELECT * FROM mensalidadesudv ${textoDbPronto} ORDER BY nomesocio DESC`
    );
    const data = result.rows;

    console.log(data);

    res.json(data);
});

app.get("/novo", async (req, res) => {
    db.query("INSERT INTO mensalidadesudv (nomesocio, grau) VALUES ($1, $2)", [
        req.query.nomesocio,
        req.query.lugar,
    ]);

    res.json("Adicionado");
});

app.get("/salvar", async (req, res) => {
    console.log(req.query.condicao);
    console.log(req.query.mes);
    console.log(req.query.nomesocio);
    if (req.query.nomesocio === "Todos") {
        db.query(`UPDATE mensalidadesudv SET ${req.query.mes} = $1`, [
            req.query.condicao,
        ]);
    } else {
        db.query(
            `UPDATE mensalidadesudv SET ${req.query.mes} = $1 WHERE nomesocio = '${req.query.nomesocio}'`,
            [req.query.condicao]
        );
    }

    res.json("Atualizado");
});

app.get("/situation", async (req, res) => {
    console.log(req.query.situacao);
    db.query(`UPDATE mensalidadesudv SET situacao = $1 WHERE nomesocio = $2`, [
        req.query.situacao,
        req.query.nomesocio,
    ]);
    console.log("Deu certo");

    res.json("Situação Alterada");
});

app.get("/excluir", (req, res) => {
    db.query("DELETE FROM mensalidadesudv WHERE id = $1", [req.query.id]);
    res.json("Sócio Eliminado");
});

app.get("/alternar", (req, res) => {
    db.query(`UPDATE mensalidadesudv SET ${req.query.mes} = $1 WHERE id = $2`, [
        req.query.condicao,
        req.query.id,
    ]);

    res.json("Alterado");
});

app.listen(port, () => {
    console.log(`Server on port ${port}`);
});