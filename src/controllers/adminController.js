const pool = require('../config/db');

async function listarUsuarios(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT id, nome, email, tipo, ativo, criado_em FROM usuarios ORDER BY criado_em DESC`
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function bloquearUsuario(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `UPDATE usuarios SET ativo = NOT ativo WHERE id = $1 RETURNING id, nome, ativo`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarTodasFeirinhas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT f.*, u.nome AS organizador_nome
       FROM feirinhas f
       JOIN usuarios u ON u.id = f.organizador_id
       ORDER BY f.criado_em DESC`
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function apagarFeirinhaAdmin(req, res) {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM feirinhas WHERE id = $1', [id]);
    res.json({ mensagem: 'Feirinha apagada pelo administrador.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { listarUsuarios, bloquearUsuario, listarTodasFeirinhas, apagarFeirinhaAdmin };