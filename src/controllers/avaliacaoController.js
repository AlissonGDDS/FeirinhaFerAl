const pool = require('../config/db');

async function criarAvaliacao(req, res) {
  const { feirinha_id, nota, comentario } = req.body;
  const usuario_id = req.usuario.id;

  if (!feirinha_id || !nota) {
    return res.status(400).json({ erro: 'Feirinha e nota são obrigatórios.' });
  }

  if (nota < 1 || nota > 5) {
    return res.status(400).json({ erro: 'A nota deve ser entre 1 e 5.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO avaliacoes (usuario_id, feirinha_id, nota, comentario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [usuario_id, feirinha_id, nota, comentario]
    );
    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarAvaliacoesPorFeirinha(req, res) {
  const { feirinha_id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT a.*, u.nome AS usuario_nome
       FROM avaliacoes a
       JOIN usuarios u ON u.id = a.usuario_id
       WHERE a.feirinha_id = $1 AND a.status = 'PUBLICADA'
       ORDER BY a.criado_em DESC`,
      [feirinha_id]
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { criarAvaliacao, listarAvaliacoesPorFeirinha };