module.exports = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER, 
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // true para Azure, false para SQL Server local padrão
        trustServerCertificate: true // Importante para ambiente de desenvolvimento local
    }
};