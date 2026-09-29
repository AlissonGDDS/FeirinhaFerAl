const express = require('express');
const router = express.Router();
const { criarCategoria, listarCategorias } = require('../controllers/categoriaController');

router.get('/', listarCategorias);
router.post('/', criarCategoria);

module.exports = router;