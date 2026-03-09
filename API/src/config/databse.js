// Preencha com as credenciais do seu SQL Server
module.exports = {
    user: 'SEU_USUARIO',
    password: 'SUA_SENHA',
    server: 'localhost', 
    database: 'NOME_DO_SEU_BANCO',
    options: {
        encrypt: true, // Necessário para Azure, opcional para local
    }
};