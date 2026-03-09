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

// Lista todos os pedidos e seus respectivos itens.

const listOrders = async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        // Busca todos os cabeçalhos de pedidos
        const ordersResult = await pool.request().query(`
            SELECT orderId, value, creationDate 
            FROM [Order]
        `);
        const orders = ordersResult.recordset;

        // Se não houver pedidos, retorna um array vazio com status 200 (OK)
        if (orders.length === 0) {
            return res.status(200).json([]);
        }

        // Busca todos os itens de uma vez (evita o problema N+1)
        const itemsResult = await pool.request().query(`
            SELECT orderId, productId, quantity, price 
            FROM Items
        `);
        const allItems = itemsResult.recordset;

        // Agrupa os itens dentro de seus respectivos pedidos
        const responseData = orders.map(order => {
            // Filtra os itens que pertencem a este pedido específico
            const orderItems = allItems.filter(item => item.orderId === order.orderId);

            return {
                orderId: order.orderId,
                value: order.value,
                creationDate: order.creationDate,
                // Mapeia para remover a coluna orderId de dentro do item, mantendo o JSON limpo
                items: orderItems.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };
        });

        // Retorna a lista completa com status 200 (OK)
        return res.status(200).json(responseData);

    } catch (error) {
        console.error('Erro ao listar os pedidos:', error);
        
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Ocorreu um erro ao listar os pedidos do banco de dados.' 
        });
    }
};

// Atualiza um pedido específico pelo ID.
const updateOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const payload = req.body;

        // 1. Validação Básica
        if (!payload.items || payload.items.length === 0) {
            return res.status(400).json({ 
                error: 'Bad Request', 
                message: 'É necessário enviar os itens do pedido para atualização.' 
            });
        }

        const pool = await sql.connect(dbConfig);

        // 2. Verifica se o pedido realmente existe antes de tentar atualizar
        const checkResult = await pool.request()
            .input('orderId', sql.VarChar, id)
            .query(`SELECT orderId FROM [Order] WHERE orderId = @orderId`);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Não é possível atualizar. Pedido '${id}' não encontrado.`
            });
        }

        // Transformação dos Dados usando o Mapper que criamos lá no começo
        const orderData = mapOrderToDatabaseModel(payload);
        
        // Garantimos que o ID a ser atualizado seja o da URL, ignorando o do body (Boa prática)
        orderData.orderId = id; 

        // Inicia a Transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Atualiza o Cabeçalho do Pedido
            const updateHeaderReq = new sql.Request(transaction);
            await updateHeaderReq
                .input('orderId', sql.VarChar, orderData.orderId)
                .input('value', sql.Numeric(10, 2), orderData.value)
                .input('creationDate', sql.DateTime, new Date(orderData.creationDate))
                .query(`
                    UPDATE [Order] 
                    SET value = @value, creationDate = @creationDate
                    WHERE orderId = @orderId
                `);

            // Deleta os Itens Antigos
            const deleteItemsReq = new sql.Request(transaction);
            await deleteItemsReq
                .input('orderId', sql.VarChar, orderData.orderId)
                .query(`DELETE FROM Items WHERE orderId = @orderId`);

            // Insere os Novos Itens
            for (const item of orderData.items) {
                const insertItemReq = new sql.Request(transaction);
                await insertItemReq
                    .input('orderId', sql.VarChar, orderData.orderId)
                    .input('productId', sql.Int, item.productId)
                    .input('quantity', sql.Int, item.quantity)
                    .input('price', sql.Numeric(10, 2), item.price)
                    .query(`
                        INSERT INTO Items (orderId, productId, quantity, price)
                        VALUES (@orderId, @productId, @quantity, @price)
                    `);
            }

            // Confirma todas as alterações no banco
            await transaction.commit();

            // Retorna sucesso (200 OK)
            return res.status(200).json({
                message: 'Pedido atualizado com sucesso!',
                data: orderData
            });

        } catch (dbError) {
            // Se algo falhar (ex: erro no insert do item), desfaz tudo
            await transaction.rollback();
            throw dbError; 
        }

    } catch (error) {
        console.error('Erro ao atualizar o pedido:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Ocorreu um erro ao atualizar o pedido no banco de dados.' 
        });
    }
};

//Exclui um pedido e seus itens do banco de dados pelo ID.

const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await sql.connect(dbConfig);

        // Verifica se o pedido existe
        const checkResult = await pool.request()
            .input('orderId', sql.VarChar, id)
            .query(`SELECT orderId FROM [Order] WHERE orderId = @orderId`);

        if (checkResult.recordset.length === 0) {
            return res.status(404).json({
                error: 'Not Found',
                message: `Não é possível excluir. Pedido '${id}' não encontrado.`
            });
        }

        // Inicia a Transação
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            // Deleta primeiro os Itens (Detalhes)
            const deleteItemsReq = new sql.Request(transaction);
            await deleteItemsReq
                .input('orderId', sql.VarChar, id)
                .query(`DELETE FROM Items WHERE orderId = @orderId`);

            // Deleta o Cabeçalho do Pedido
            const deleteHeaderReq = new sql.Request(transaction);
            await deleteHeaderReq
                .input('orderId', sql.VarChar, id)
                .query(`DELETE FROM [Order] WHERE orderId = @orderId`);

            // Confirma a exclusão de ambas as tabelas
            await transaction.commit();

            // Retorna sucesso (200 OK)
            return res.status(200).json({
                message: `Pedido '${id}' e seus itens foram excluídos com sucesso.`
            });

        } catch (dbError) {
            // Se algo der errado na exclusão de alguma das tabelas, desfaz tudo
            await transaction.rollback();
            throw dbError; 
        }

    } catch (error) {
        console.error('Erro ao excluir o pedido:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error', 
            message: 'Ocorreu um erro ao excluir o pedido no banco de dados.' 
        });
    }
};

module.exports = {
    createOrder,
    getOrder,
    listOrders,
    updateOrder,
    deleteOrder
};