# 📦 API de Gerenciamento de Pedidos

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![SQL Server](https://img.shields.io/badge/SQL_Server-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black)

Uma API RESTful desenvolvida em Node.js para o gerenciamento de pedidos e seus itens. O projeto contempla operações de CRUD completo, integração com banco de dados relacional (SQL Server) utilizando transações (ACID), mapeamento e transformação de dados (DTO), autenticação via tokens JWT e documentação interativa via Swagger.

## 🚀 Tecnologias Utilizadas

* **Node.js & Express:** Framework web para construção das rotas e servidor.
* **mssql:** Driver oficial para conexão e consultas ao Microsoft SQL Server.
* **jsonwebtoken (JWT):** Implementação de camada de segurança para rotas privadas.
* **dotenv:** Gerenciamento seguro de variáveis de ambiente.
* **swagger-ui-express & swagger-jsdoc:** Geração automática de documentação OpenAPI.

---

## 🛠️ Como configurar o projeto localmente

Siga o passo a passo abaixo para configurar, instalar e testar a API na sua máquina.

### 1. Pré-requisitos
* [Node.js](https://nodejs.org/) (v14 ou superior) instalado.
* Uma instância do **Microsoft SQL Server** rodando localmente ou na nuvem.
* Git instalado na máquina.

### 2. Clonando o Repositório
Clone o repositório localmente
```
https://github.com/doglast/API_Pedidos/
```

### 3. Instalando as Dependências
```
  npm install
```

### 4. Configurando o Banco de Dados
No seu SQL Server (via SQL Server Management Studio ou Azure Data Studio), execute o script [01_CreateTables.sql](https://github.com/doglast/API_Pedidos/blob/463a5d573868af940f42431b93a98f75a9ca206a/Scripts/01_CreateTables.sql), que se encontra na pasta Scripts do repositório, para criar as tabelas necessárias.

### 5. Configurando as Variáveis de Ambiente
Dentro da pasta API, crie um arquivo chamado .env e preencha com as suas credenciais de banco de dados e chave secreta:
```
PORT=3000
JWT_SECRET=sua_chave_secreta_aqui
DB_USER=seu_usuario_do_sql
DB_PASS=sua_senha_do_sql
DB_SERVER=localhost
DB_NAME=nome_do_seu_banco
```
*(Nota: O arquivo .env não é enviado ao repositório por questões de segurança, conforme configurado no .gitignore).*

### 6. Iniciando o Servidor
Execute o comando abaixo para ligar a API:

```
node src/app.js
```
Você verá a mensagem: Servidor rodando na porta 3000

---

# 📖 Como Testar a API (Documentação Swagger)
Para facilitar os testes sem a necessidade de ferramentas externas como o Postman, esta API possui documentação interativa.

Com o servidor rodando, abra o navegador e acesse: http://localhost:3000/api-docs

Autenticação (Importante): Todas as rotas de pedidos são protegidas.

Vá até a rota POST /login, clique em Try it out e execute.

Credenciais de teste: username: admin / password: 123456.

Copie o token gerado na resposta.

Suba até o topo da página, clique no botão verde Authorize, cole o token e clique em Authorize.

Agora você pode testar livremente as rotas de criação, listagem, busca, atualização e exclusão de pedidos pelo próprio Swagger!
