const pool = require('../config/db');

async function tentarGeocodificar(texto) {
  const query = encodeURIComponent(texto);
  const resposta = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=br`,
    { headers: { 'User-Agent': 'FerAL-App' } }
  );
  const dados = await resposta.json();
  console.log(`Tentativa "${texto}":`, dados.length > 0 ? 'encontrado' : 'não encontrado');
  return dados;
}

async function buscarCoordenadas(endereco, cidade, estado) {
  try {
    if (endereco) {
      const dados1 = await tentarGeocodificar(`${endereco}, ${cidade}, ${estado}, Brasil`);
      if (dados1.length > 0) {
        return { latitude: dados1[0].lat, longitude: dados1[0].lon };
      }

      const bairro = endereco.split(',').pop().trim();
      const dados2 = await tentarGeocodificar(`${bairro}, ${cidade}, ${estado}, Brasil`);
      if (dados2.length > 0) {
        return { latitude: dados2[0].lat, longitude: dados2[0].lon };
      }
    }

    const dados3 = await tentarGeocodificar(`${cidade}, ${estado}, Brasil`);
    if (dados3.length > 0) {
      return { latitude: dados3[0].lat, longitude: dados3[0].lon };
    }

    return { latitude: null, longitude: null };
  } catch (err) {
    console.log('ERRO ao buscar coordenadas:', err.message);
    return { latitude: null, longitude: null };
  }
}

async function criarFeirinha(req, res) {
  const {
    nome,
    descricao,
    data_inicio,
    data_fim,
    horario_inicio,
    horario_fim,
    endereco,
    cidade,
    estado,
    cep,
    categoria_id,
    imagem_url,
  } = req.body;

  const organizador_id = req.usuario.id;

  if (!nome || !data_inicio) {
    return res.status(400).json({ erro: 'Nome e data de início são obrigatórios.' });
  }

  try {
    const { latitude, longitude } = await buscarCoordenadas(endereco, cidade, estado);

    const resultado = await pool.query(
      `INSERT INTO feirinhas
        (organizador_id, nome, descricao, data_inicio, data_fim, horario_inicio, horario_fim, endereco, cidade, estado, cep, imagem_url, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [organizador_id, nome, descricao, data_inicio, data_fim, horario_inicio, horario_fim, endereco, cidade, estado, cep, imagem_url, latitude, longitude]
    );

    const feirinha = resultado.rows[0];

    if (categoria_id) {
      await pool.query(
        `INSERT INTO feirinha_categorias (feirinha_id, categoria_id) VALUES ($1, $2)`,
        [feirinha.id, categoria_id]
      );
    }

    res.status(201).json(feirinha);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function listarFeirinhas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT f.*, c.nome AS categoria_nome, c.id AS categoria_id
       FROM feirinhas f
       LEFT JOIN feirinha_categorias fc ON fc.feirinha_id = f.id
       LEFT JOIN categorias c ON c.id = fc.categoria_id
       ORDER BY f.data_inicio ASC`
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function minhasFeirinhas(req, res) {
  const organizador_id = req.usuario.id;

  try {
    const resultado = await pool.query(
      `SELECT * FROM feirinhas WHERE organizador_id = $1 ORDER BY data_inicio ASC`,
      [organizador_id]
    );
    res.json(resultado.rows);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function editarFeirinha(req, res) {
  const { id } = req.params;
  const organizador_id = req.usuario.id;
  const {
    nome,
    descricao,
    data_inicio,
    data_fim,
    horario_inicio,
    horario_fim,
    endereco,
    cidade,
    estado,
    cep,
    imagem_url,
  } = req.body;

  try {
    const feirinha = await pool.query('SELECT * FROM feirinhas WHERE id = $1', [id]);

    if (feirinha.rows.length === 0) {
      return res.status(404).json({ erro: 'Feirinha não encontrada.' });
    }

    if (feirinha.rows[0].organizador_id !== organizador_id) {
      return res.status(403).json({ erro: 'Você não tem permissão para editar esta feirinha.' });
    }

    const { latitude, longitude } = await buscarCoordenadas(endereco, cidade, estado);

    const resultado = await pool.query(
      `UPDATE feirinhas SET
        nome = $1,
        descricao = $2,
        data_inicio = $3,
        data_fim = $4,
        horario_inicio = $5,
        horario_fim = $6,
        endereco = $7,
        cidade = $8,
        estado = $9,
        cep = $10,
        imagem_url = $11,
        latitude = $12,
        longitude = $13,
        atualizado_em = NOW()
       WHERE id = $14
       RETURNING *`,
      [nome, descricao, data_inicio, data_fim, horario_inicio, horario_fim, endereco, cidade, estado, cep, imagem_url, latitude, longitude, id]
    );

    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function apagarFeirinha(req, res) {
  const { id } = req.params;
  const organizador_id = req.usuario.id;

  try {
    const feirinha = await pool.query('SELECT * FROM feirinhas WHERE id = $1', [id]);

    if (feirinha.rows.length === 0) {
      return res.status(404).json({ erro: 'Feirinha não encontrada.' });
    }

    if (feirinha.rows[0].organizador_id !== organizador_id) {
      return res.status(403).json({ erro: 'Você não tem permissão para apagar esta feirinha.' });
    }

    await pool.query('DELETE FROM feirinhas WHERE id = $1', [id]);

    res.json({ mensagem: 'Feirinha apagada com sucesso.' });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

async function buscarFeirinhaPorId(req, res) {
  const { id } = req.params;

  try {
    const resultado = await pool.query(
      `SELECT f.*, c.nome AS categoria_nome, c.id AS categoria_id
       FROM feirinhas f
       LEFT JOIN feirinha_categorias fc ON fc.feirinha_id = f.id
       LEFT JOIN categorias c ON c.id = fc.categoria_id
       WHERE f.id = $1`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Feirinha não encontrada.' });
    }

    res.json(resultado.rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
}

module.exports = { criarFeirinha, listarFeirinhas, minhasFeirinhas, editarFeirinha, apagarFeirinha, buscarFeirinhaPorId };