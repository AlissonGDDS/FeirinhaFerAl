const pool = require('../config/db');

async function criarFeedback(req, res) {
  const { feirinha_id, nota, comentario } = req.body;
  const organizador_id = req.usuario.id;

  if (!feirinha_id || !nota) {
    return res.status(400).json({ erro: 'Feirinha e nota são obrigatórios.' });
  }

  if (nota < 1 || nota > 5) {
    return res.status(400).json({ erro: 'A nota deve ser entre 1 e 5.' });
  }

  try {
    const feirinha = await pool.query('SELECT * FROM feirinhas WHERE id = $1', [feirinha_id]);

    if (feirinha.rows.length === 0) {
      return res.status(404).json({ erro: 'Feirinha não encontrada.' });
    }

    if (feirinha.rows[0].organizador_id !== organizador_id) {
      return res.status(403).json({ erro: 'Você só pode dar feedback sobre suas próprias feirinhas.' });
    }

    const resultado = await pool.query(
      `INSERT INTO feedbacks (organizador_id, feirinha_id, nota, comentario)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [organizador_id, feirinha_id, nota, comentario]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarMeusFeedbacks(req, res) {
  const organizador_id = req.usuario.id;

  try {
    const resultado = await pool.query(
      `SELECT fb.*, f.nome AS feirinha_nome
       FROM feedbacks fb
       JOIN feirinhas f ON f.id = fb.feirinha_id
       WHERE fb.organizador_id = $1
       ORDER BY fb.criado_em DESC`,
      [organizador_id]
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { criarFeedback, listarMeusFeedbacks };