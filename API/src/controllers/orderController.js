const sql = require('mssql');
const { mapOrderToDatabaseModel } = require('../utils/orderMapper');
const dbConfig = require('../config/database');

// Cria um novo pedido no banco de dados.

const createOrder = async (req, res) => {
    try {
        const payload = req.body;

        // Validação Básica
        if (!payload.numeroPedido || !payload.items || payload.items.length === 0) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'Campos obrigatórios ausentes. Verifique o numeroPedido e os items.' 
            });
        }

        // Transformação dos Dados (Mapping)
        const orderData = mapOrderToDatabaseModel(payload);

        // Conexão com o Banco e Transação
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

            // Retorno de Sucesso (201 Created) e o dado mapeado para confirmação
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
        
        // Tratamento de Erro Robusto (500 Internal Server Error)
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Ocorreu um erro ao processar e salvar o pedido no banco de dados.' 
        });
    }
};

// Busca um pedido específico pelo ID.

const getOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const pool = await sql.connect(dbConfig);
        
        const orderResult = await pool.request()
            .input('orderId', sql.VarChar, id)
            .query(`
                SELECT orderId, value, creationDate 
                FROM [Order] 
                WHERE orderId = @orderId
            `);

        // Validação: Se não encontrou o pedido, retorna 404 (Not Found)
        if (orderResult.recordset.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Pedido com o número '${id}' não foi encontrado.`
            });
        }

        const orderHeader = orderResult.recordset[0];

        
        const itemsResult = await pool.request()
            .input('orderId', sql.VarChar, id)
            .query(`
                SELECT productId, quantity, price 
                FROM Items 
                WHERE orderId = @orderId
            `);

        // Monta o objeto final combinando o Pedido e seus Itens
        const responseData = {
            orderId: orderHeader.orderId,
            value: orderHeader.value,
            creationDate: orderHeader.creationDate,
            items: itemsResult.recordset
        };

        // Retorna 200 (OK) com os dados
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Erro ao buscar o pedido:', error);
        
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Ocorreu um erro ao consultar o pedido no banco de dados.' 
        });
    }
};

module.exports = {
    createOrder,
    getOrder
};