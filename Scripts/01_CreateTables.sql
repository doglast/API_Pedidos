-- Criação da tabela: Order
--Validação se a tabela já não existe, para evitar erros durante a execução em bases que já tenham as tabelas
IF OBJECT_ID('dbo.[Order]', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Order] (
        orderId VARCHAR(20) NOT NULL,
        value INT NULL,
        creationDate DATETIME NULL,
        
        -- Definindo a Chave Primária
        CONSTRAINT PK_Order PRIMARY KEY (orderId)
    );
    PRINT 'Tabela [Order] criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'A tabela [Order] já existe no banco de dados.';
END
GO

-- Criação da tabela: Items
IF OBJECT_ID('dbo.Items', 'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[Items] (
        orderId UNIQUEIDENTIFIER NOT NULL, 
        productId INT NULL,
        quantity INT NULL,
        price INT NULL,

        -- Definindo a Chave Primária
        CONSTRAINT PK_Items PRIMARY KEY (orderId)
    );
    PRINT 'Tabela [Items] criada com sucesso.';
END
ELSE
BEGIN
    PRINT 'A tabela [Items] já existe no banco de dados.';
END
GO