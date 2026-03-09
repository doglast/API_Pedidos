const jwt = require('jsonwebtoken');

// Chave vem do arquivo de configuração 'dotenv'.
const SECRET_KEY = process.env.JWT_SECRET;

// Gera um token JWT se as credenciais forem válidas.

const login = (req, res) => {
    const { username, password } = req.body;

    // Simulação de verificação no banco de dados
    if (username === 'admin' && password === '123456') {
        // Gera o token com dados do usuário (payload), a chave secreta e o tempo de expiração
        const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
        
        return res.status(200).json({ 
            message: 'Login realizado com sucesso!',
            token 
        });
    }

    // Se as credenciais estiverem erradas, retorna 401 Unauthorized
    return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'Usuário ou senha inválidos.' 
    });
};

module.exports = {
    login,
    SECRET_KEY
};