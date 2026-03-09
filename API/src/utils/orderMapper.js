/**
 * Transforma o payload recebido na requisição para o formato do banco de dados.
 * @param {Object} payload - O JSON recebido no body da requisição.
 * @returns {Object} O objeto mapeado pronto para persistência.
 */
const mapOrderToDatabaseModel = (payload) => {
    // Tratamento para garantir que a data fique no formato ISO padrão (Z)
    const creationDate = new Date(payload.dataCriacao).toISOString();
    const orderId = payload.numeroPedido;

    const items = payload.items.map(item => ({
        productId: Number(item.idItem),
        quantity: item.quantidadeItem,
        price: item.valorItem
    }));

    return {
        orderId,
        value: payload.valorTotal,
        creationDate,
        items
    };
};

module.exports = {
    mapOrderToDatabaseModel
};