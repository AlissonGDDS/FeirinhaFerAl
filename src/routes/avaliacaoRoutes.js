const express = require('express');
const router = express.Router();
const { criarAvaliacao, listarAvaliacoesPorFeirinha } = require('../controllers/avaliacaoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/feirinha/:feirinha_id', listarAvaliacoesPorFeirinha);
router.post('/', verificarToken, criarAvaliacao);

module.exports = router;