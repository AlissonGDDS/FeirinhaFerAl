const express = require('express');
const router = express.Router();
const { criarFeedback, listarMeusFeedbacks } = require('../controllers/feedbackController');
const verificarToken = require('../middlewares/authMiddleware');

router.get('/', verificarToken, listarMeusFeedbacks);
router.post('/', verificarToken, criarFeedback);

module.exports = router;