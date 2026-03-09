const jwt = require('jsonwebtoken');
const { SECRET_KEY } = process.env.JWT_SECRET;

//Intercepta a requisição e verifica se o token JWT é válido.

const authenticateToken = (req, res, next) => {
    // O token geralmente é enviado no cabeçalho "Authorization: Bearer <token>"
    const authHeader = req.headers['authorization'];
    
    // Divide a string e pega apenas a segunda parte (o token em si)
    const token = authHeader && authHeader.split(' ')[1]; 

    // Se não tem token, bloqueia a entrada (401)
    if (!token) {
        return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Acesso negado. Nenhum token foi fornecido.' 
        });
    }

    // Verifica se o token é válido e não expirou
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                error: 'Forbidden', 
                message: 'Acesso negado. Token inválido ou expirado.' 
            });
        }

        // Se deu tudo certo, salva os dados do usuário na requisição e passa para o próximo passo
        req.user = user;
        next(); 
    });
};

module.exports = authenticateToken;