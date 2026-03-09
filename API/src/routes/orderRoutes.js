const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/authMiddleware');

// Rota POST para criar pedido
router.post('/order', authenticateToken, orderController.createOrder);

// Rota GET para listar TODOS os pedidos
router.get('/order/list', authenticateToken, orderController.listOrders);

// Rota GET para buscar pedido por ID, ":id" indica que essa parte da URL é dinâmica e será passada como parâmetro
router.get('/order/:id', authenticateToken, orderController.getOrder);

// Rota PUT para atualizar o pedido
router.put('/order/:id', authenticateToken, orderController.updateOrder);

// Rota DELETE para excluir o pedido
router.delete('/order/:id', authenticateToken, orderController.deleteOrder);

module.exports = router;