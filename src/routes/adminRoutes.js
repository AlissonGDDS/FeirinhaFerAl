const express = require('express');
const router = express.Router();
const {
  listarUsuarios,
  bloquearUsuario,
  listarTodasFeirinhas,
  apagarFeirinhaAdmin,
} = require('../controllers/adminController');
const verificarToken = require('../middlewares/authMiddleware');
const verificarAdmin = require('../middlewares/adminMiddleware');

router.get('/usuarios', verificarToken, verificarAdmin, listarUsuarios);
router.put('/usuarios/:id/bloquear', verificarToken, verificarAdmin, bloquearUsuario);
router.get('/feirinhas', verificarToken, verificarAdmin, listarTodasFeirinhas);
router.delete('/feirinhas/:id', verificarToken, verificarAdmin, apagarFeirinhaAdmin);

module.exports = router;