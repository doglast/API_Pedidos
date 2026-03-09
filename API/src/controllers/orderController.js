const sql = require('mssql');
const { mapOrderToDatabaseModel } = require('../utils/orderMapper');
const dbConfig = require('../config/database');

/**
 * Cria um novo pedido no banco de dados.
 */
const createOrder = async (req, res) => {
    try {
        const payload = req.body;

        // 1. Validação Básica
        if (!payload.numeroPedido || !payload.items || payload.items.length === 0) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Campos obrigatórios ausentes. Verifique o numeroPedido e os items.' 
            });
        }

        // 2. Transformação dos Dados (Mapping)
        const orderData = mapOrderToDatabaseModel(payload);

        // 3. Conexão com o Banco e Transação
        const pool = await sql.connect(dbConfig);
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();

        try {
            const request = new sql.Request(transaction);

            await request
                .input('orderId', sql.VarChar, orderData.orderId)
                .input('value', sql.Numeric(10, 2), orderData.value)
                .input('creationDate', sql.DateTime, new Date(orderData.creationDate))
                .query(`
                    INSERT INTO Order (orderId, value, creationDate)
                    VALUES (@orderId, @value, @creationDate)
                `);

            for (const item of orderData.items) {
                const itemRequest = new sql.Request(transaction);
                await itemRequest
                    .input('orderId', sql.VarChar, orderData.orderId)
                    .input('productId', sql.Int, item.productId)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Numeric(10, 2), item.price)
                    .query(`
                        INSERT INTO Items (orderId, productId, quantity, price)
                        VALUES (@orderId, @productId, @quantity, @price)
                    `);
            }

            // Confirma a transação se tudo der certo
            await transaction.commit();

            // 4. Retorno de Sucesso (201 Created) e o dado mapeado para confirmação
            return res.status(201).json({
                message: 'Pedido criado com sucesso!',
                data: orderData
            });

        } catch (dbError) {
            // Se falhar na inserção, executa rollback e joga o erro para o catch principal
            await transaction.rollback();
            throw dbError; 
        }

    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        
        // 5. Tratamento de Erro Robusto (500 Internal Server Error)
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Ocorreu um erro ao processar e salvar o pedido no banco de dados.' 
        });
    }
};

module.exports = {
    createOrder
};