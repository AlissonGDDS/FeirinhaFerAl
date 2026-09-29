const express = require('express');
const router = express.Router();
const { criarFeirinha, listarFeirinhas, minhasFeirinhas, editarFeirinha, apagarFeirinha, buscarFeirinhaPorId } = require('../controllers/feirinhaController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', listarFeirinhas);
router.get('/minhas', verificarToken, minhasFeirinhas);
router.get('/:id', buscarFeirinhaPorId);
router.post('/', verificarToken, criarFeirinha);
router.put('/:id', verificarToken, editarFeirinha);
router.delete('/:id', verificarToken, apagarFeirinha);

module.exports = router;