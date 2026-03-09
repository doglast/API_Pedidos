const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Cria um novo pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numeroPedido:
 *                 type: string
 *                 example: "v10089015vdb 01"
 *               valorTotal:
 *                 type: number
 *                 example: 10000
 *               dataCriacao:
 *                 type: string
 *                 example: "2023 07 19T12:24:11.529Z"
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idItem:
 *                       type: string
 *                       example: "2434"
 *                     quantidadeItem:
 *                       type: integer
 *                       example: 1
 *                     valorItem:
 *                       type: number
 *                       example: 1000
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 */
// Rota POST para criar pedido
router.post('/order', authenticateToken, orderController.createOrder);

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Retorna uma lista de pedidos.
 *       401:
 *         description: Não autorizado.
 */
// Rota GET para listar TODOS os pedidos
router.get('/order/list', authenticateToken, orderController.listOrders);

// Rota GET para buscar pedido por ID, ":id" indica que essa parte da URL é dinâmica e será passada como parâmetro
router.get('/order/:id', authenticateToken, orderController.getOrder);

// Rota PUT para atualizar o pedido
router.put('/order/:id', authenticateToken, orderController.updateOrder);

// Rota DELETE para excluir o pedido
router.delete('/order/:id', authenticateToken, orderController.deleteOrder);

module.exports = router;