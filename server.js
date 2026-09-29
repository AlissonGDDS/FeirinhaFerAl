const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./src/config/db');
const usuarioRoutes = require('./src/routes/usuarioRoutes');
const feirinhaRoutes = require('./src/routes/feirinhaRoutes');
const categoriaRoutes = require('./src/routes/categoriaRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const avaliacaoRoutes = require('./src/routes/avaliacaoRoutes');
const favoritoRoutes = require('./src/routes/favoritoRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const feedbackRoutes = require('./src/routes/feedbackRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ status: 'Fer AL API rodando' });
});

app.get('/api/teste-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ conectado: true, horario: result.rows[0] });
  } catch (err) {
    res.status(500).json({ conectado: false, erro: err.message });
  }
});

app.use('/api/usuarios', usuarioRoutes);
app.use('/api/feirinhas', feirinhaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));