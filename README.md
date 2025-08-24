# Bounded Contexts

- **Sala de Aula**
  - Usuário: **Aluno**
- **Financeiro**
  - Usuário: **Pai/Mãe**

# DDD - Linguagem Ubíqua

- **Definição**: Linguagem de negócio/domínio compartilhada entre as equipes técnicas e de negócio para garantir consistência e clareza.

# Dificuldades

- **Orders**: 
  - Compra fechada deve se comunicar com o serviço de nota fiscal.
- **Invoices**: 
  - A nota fiscal é gerada, enviada de volta e encaminhada para o serviço de e-mail.
- **Desafios Técnicos**:
  - Cada serviço possui seu próprio banco de dados, o que pode gerar duplicação de dados.
  - Não há suporte a *joins* entre bancos de dados distintos.
  - **Overhead operacional**: Gerenciamento repetitivo de múltiplos serviços.
- **Performance HTTP**:
  - POST: 200ms
    - 50ms
    - 80ms
    - 20ms

# Exemplo

- **Serviços**: Orders e Invoices
  - Ambos possuem bancos de dados independentes.
- **Comunicação**:
  - **Message Broker**: 
    - Quando o cliente faz um pedido, o serviço Orders se comunica com o Message Broker, e o Invoices consulta para gerar a nota fiscal.
  - **Métodos de Comunicação**:
    - **HTTP**: O serviço Orders depende do serviço Invoices estar ativo para finalizar a requisição.
    - **gRPC**: Similar ao HTTP, depende da disponibilidade do serviço Invoices.
    - **Async**: Orders emite um evento via message broker, enviando as informações do cliente de forma assíncrona.
  - **Funcionamento do Message Broker**:
    - Sistema com banco de dados próprio, responsável por armazenar mensagens enviadas pelos serviços.
    - Elimina a comunicação direta entre serviços.
    - O serviço Invoices consulta o message broker para verificar pendências e gerar a nota fiscal.
  - **Fluxo**: 
    - Orders → *Publish* → Message Broker ← *Consumer* Invoices
  - **Ferramentas**:
    - **RabbitMQ/Kafka**: Troca de mensagens de forma assíncrona.

# Trabalhando com o frontend:

- Em uma arquiterura de microsserviçoes, pequenas asplicações, sendo `app 01` e `app 02`. Duas aplicações.
  - fetch("orders.rocketseat.com.br")
  - fetch("invoices.rocketseat.com.br")

# API Gateway

- Uma aplicação que vive entre os serviços, uma aplicação que centraliza todos os endpoints, todas as rotas.
  - GET /orders -> https://nb2ju1nb3213-orders.rocketseat.com.br