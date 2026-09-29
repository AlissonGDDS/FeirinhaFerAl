const pool = require('../config/db');

async function adicionarFavorito(req, res) {
  const { feirinha_id } = req.body;
  const usuario_id = req.usuario.id;

  try {
    const resultado = await pool.query(
      `INSERT INTO favoritos (usuario_id, feirinha_id) VALUES ($1, $2) RETURNING *`,
      [usuario_id, feirinha_id]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Você já favoritou esta feirinha.' });
    }
    res.status(500).json({ erro: err.message });
  }
}

async function removerFavorito(req, res) {
  const { feirinha_id } = req.params;
  const usuario_id = req.usuario.id;

  try {
    await pool.query(
      `DELETE FROM favoritos WHERE usuario_id = $1 AND feirinha_id = $2`,
      [usuario_id, feirinha_id]
    );
    res.json({ mensagem: 'Favorito removido.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarMeusFavoritos(req, res) {
  const usuario_id = req.usuario.id;

  try {
    const resultado = await pool.query(
      `SELECT f.*, c.nome AS categoria_nome
       FROM favoritos fav
       JOIN feirinhas f ON f.id = fav.feirinha_id
       LEFT JOIN feirinha_categorias fc ON fc.feirinha_id = f.id
       LEFT JOIN categorias c ON c.id = fc.categoria_id
       WHERE fav.usuario_id = $1
       ORDER BY fav.criado_em DESC`,
      [usuario_id]
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { adicionarFavorito, removerFavorito, listarMeusFavoritos };