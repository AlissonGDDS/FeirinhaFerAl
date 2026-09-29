const pool = require('../config/db');

async function criarCategoria(req, res) {
  const { nome, descricao } = req.body;

  if (!nome) {
    return res.status(400).json({ erro: 'Nome da categoria é obrigatório.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO categorias (nome, descricao) VALUES ($1, $2) RETURNING *`,
      [nome, descricao]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarCategorias(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT * FROM categorias WHERE ativo = true ORDER BY nome ASC`
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { criarCategoria, listarCategorias };