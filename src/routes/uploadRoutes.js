const express = require('express');
const router = express.Router();
const upload = require('../config/upload');
const verificarToken = require('../middlewares/authMiddleware');

router.post('/', verificarToken, upload.single('imagem'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
  }

  res.json({ imagem_url: `/uploads/${req.file.filename}` });
});

module.exports = router;