const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.listar);
router.post('/', productosController.crear);

module.exports = router;
