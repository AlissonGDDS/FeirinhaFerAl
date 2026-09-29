const express = require('express');
const router = express.Router();
const { adicionarFavorito, removerFavorito, listarMeusFavoritos } = require('../controllers/favoritoController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', verificarToken, listarMeusFavoritos);
router.post('/', verificarToken, adicionarFavorito);
router.delete('/:feirinha_id', verificarToken, removerFavorito);

module.exports = router;