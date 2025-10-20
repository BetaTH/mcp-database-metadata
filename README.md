# MCP - Database Metadata

Servidor MCP (Model Context Protocol) para buscar metadados de tabelas de banco de dados. Este servidor pode ser executado como um serviço HTTP ou como uma ferramenta de linha de comando (CLI), permitindo que modelos de linguagem interajam com seus bancos de dados de forma segura e estruturada.

## ✨ Features

- **Dois Modos de Operação**: Funciona como um servidor HTTP persistente ou como um CLI sob demanda via `npx`.
- **Configuração Flexível**: Suporta uma hierarquia de arquivos de configuração (global, local e por argumento) que são mesclados em tempo de execução.
- **Ferramentas de Introspecção**: Fornece ferramentas para listar bancos de dados disponíveis e obter detalhes de tabelas (colunas, chaves, etc.).
- **Geração de Prompts**: Inclui um prompt especializado para auxiliar na criação de migrações de banco de dados para um projeto específico (Agrotrace).
- **Suporte a Múltiplos Bancos**: Suporta oficialmente **PostgreSQL** e **MySQL**. Configure conexões para diferentes bancos de dados no mesmo servidor.

## ⚙️ Configuração

O servidor utiliza um sistema de configuração hierárquico para carregar os detalhes de conexão do banco de dados. A ordem de prioridade é a seguinte:

1.  **Argumento de Linha de Comando / Variável de Ambiente** (Maior prioridade)
2.  **Arquivo Local do Projeto**
3.  **Arquivo Global do Usuário** (Menor prioridade)

Os arquivos são mesclados, permitindo que você tenha uma configuração base global e a sobrescreva em projetos específicos ou em uma execução particular.

### 1. Inicializando a Configuração

Para criar um arquivo de configuração global com uma estrutura de exemplo, execute o comando `init`:

```bash
npx mcp-database-metadata init
```

Este comando criará o arquivo `settings.json` no seguinte local, dependendo do seu sistema operacional:

-   **Linux/macOS**: `~/.mcp-database-metadata/settings.json`
-   **Windows**: `C:\Users\<SeuUsuario>\.mcp-database-metadata\settings.json`

### 2. Arquivos de Configuração

-   **Global**: O arquivo criado pelo comando `init`. Ótimo para configurações que você usa em vários projetos.
-   **Local**: Você pode criar um arquivo chamado `mcp-database-metadata.settings.json` na raiz do seu projeto. As configurações neste arquivo sobrescreverão as do arquivo global.
-   **Via Argumento**: Você pode especificar um caminho para um arquivo de configuração ao iniciar o servidor. Esta configuração tem a maior prioridade.

### Criando o Arquivo de Configuração Global de Forma Manual

Crie um arquivo chamado `settings.json` no seguinte local, dependendo do seu sistema operacional:

-   **Linux/macOS**: `~/.mcp-database-metadata/settings.json`
-   **Windows**: `C:\Users\<SeuUsuario>\.mcp-database-metadata\settings.json`

### Exemplo de `settings.json`

O arquivo de configuração permite definir uma lista de bancos de dados. O servidor usará [Knex.js](https://knexjs.org/) para se conectar, então a configuração deve ser compatível.

```json
{
  "databaseConnections": [
    {
      "connectionName": "meu_banco_pg",
      "client": "pg",
      "connection": {
        "host": "127.0.0.1",
        "port": 5432,
        "user": "usuario_pg",
        "password": "senha_pg",
        "database": "banco_de_dados_1"
      }
    },
    {
      "connectionName": "meu_banco_mysql",
      "client": "mysql",
      "connection": {
        "host": "127.0.0.1",
        "port": 3306,
        "user": "usuario_mysql",
        "password": "senha_mysql",
        "database": "banco_de_dados_2"
      }
    }
  ]
}
```

## 🚀 Uso

### Pré-requisitos

-   [Node.js](https://nodejs.org/en/) (versão 20 ou superior)
-   [pnpm](https://pnpm.io/) (recomendado)

### Instalação

Para desenvolvimento local, clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/mcp-database-metadata.git
cd mcp-database-metadata
pnpm install
```

### Modo 1: Servidor HTTP

Ideal para ser executado como um serviço de fundo persistente.

1.  **Construa o projeto:**
    ```bash
    pnpm build
    ```
2.  **Inicie o servidor:**
    ```bash
    pnpm start
    ```

Por padrão, o servidor rodará em `http://localhost:3000` e o endpoint MCP estará em `/mcp`.

Para usar um arquivo de configuração específico, defina a variável de ambiente `MCP_CONFIG_PATH`:

```bash
MCP_CONFIG_PATH=./caminho/para/config.json pnpm start
```

### Modo 2: Linha de Comando (CLI)

Perfeito para uso sob demanda com `npx`, sem a necessidade de clonar o projeto. É a forma recomendada para integrar com outras ferramentas, como o Context7.

-   **Para iniciar o servidor com a configuração padrão (local e global):**
    ```bash
    npx mcp-database-metadata
    ```
-   **Para especificar um arquivo de configuração:**
    ```bash
    npx mcp-database-metadata -c ./caminho/para/config.json
    # ou
    npx mcp-database-metadata --config ./caminho/para/config.json
    ```

## 🛠️ Ferramentas e Prompts Disponíveis

### Ferramentas (Tools)

-   `get-databases-available`
    -   **Descrição**: Lista os nomes de todos os bancos de dados configurados nos arquivos `settings.json`.
    -   **Input**: Nenhum.
    -   **Output**: `{ "databases": ["nome_db1", "nome_db2"] }`

-   `get-table-details`
    -   **Descrição**: Busca os metadados detalhados de uma tabela específica em um banco de dados.
    -   **Input**: `{ "connectionName": string, "tableName": string }`
    -   **Output**: Um objeto JSON contendo nome da tabela, colunas, chaves, índices e triggers.

### Prompts

-   `agrotrace-migration-prompt`
    -   **Descrição**: Um prompt especializado que atua como um assistente para gerar migrações SQL (up e down) para o projeto "Agrotrace", seguindo as convenções específicas de tabelas de auditoria e triggers daquele projeto.

## 🧪 Testes

O projeto possui uma suíte de testes de integração que valida a conexão e a busca de metadados em bancos de dados reais (PostgreSQL e MySQL) usando Docker.

Para executar os testes, utilize o comando:

```bash
pnpm test
```

## 🏗️ Desenvolvimento

-   **Executar em modo de desenvolvimento (com hot-reload):**
    ```bash
    pnpm dev
    ```
-   **Executar os testes:**
    ```bash
    pnpm test
    ```
-   **Construir para produção:**
    ```bash
    pnpm build
    ```
-   **Formatação e Lint:**
    Este projeto usa o [Biome](https://biomejs.dev/) para formatação e lint. Verifique o arquivo `biome.json` para as regras.

## 🤖 Exemplo de Configuração em Clientes MCP (Gemini CLI)

Para usar este servidor MCP com o Gemini CLI, adicione a seguinte configuração ao seu arquivo `settings.json` do Gemini CLI:

```json
{
  "mcpServers": {
    "databaseDetails": {
      "command": "npx",
      "args": ["mcp-database-metadata"],
      "trust": true
    }
  }
}
```