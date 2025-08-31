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
  - KongHQ: https://konghq.com/
  - POST /orders -> httpas://ada23131231eweea-orders.rocketseat.com.br
  - Direciona a chamada dentre todos os serviços presentes/disponíveis.

# Comandos

- npm init -y
- npm i fastify @fastify/cors fastify-type-provider-zod zod
- Em package: "script" -> "dev": "node --experimental-strip-types --watch --no-warnings src/http/server.ts"
- Em package: "script" -> "start": "node --experimental-strip-types --no-warnings src/http/server.ts"
- npm i typescript @types/node -D
- npm i @tsconfig/node22 -D
- npm i drizzle-kit
- npm i drizzle-orm

# Escalonamento Horizontal


# Deploy: Blue-green deployment

# Deploy: Blue-green deployment

# Distributed Tracing
  - No momento que o usuário realiza uma solicitação de pedido, ou seja, um pedido novo. Deve se criar um `traceId`, uma identificação única da requisição. De serviço em serviço, após o envio ao message broker (serviço de mensageria), sempre levando o `traceId` entre as mensagens.
  - Ex.: O serviço de `Invoices` (consumer), irá checar o message broker em busca de algum evento de mensagem. Se tiver algum, fará a emissão da nota fiscal junto do `traceId`. Estando no sistema de monitoramento, é só encaminhar o traceId junto da requisição. Deste jeito, é possível ver quanto tempo a solicitação leva em cada serviço.

# Serviços que utilizam serviços, mas o banco está fora...

-  Contexto: Um usuário cria um pedido (serviço de orders), o so dispara uma mensagem ao serviço de `payment`, e este se comunica com o Stripe. No entanto, o banco de dados do serviço de `payment` está offline. Ou seja, o sistema tentaria novamente daqui alguns segundos, e assim, bateria no Stripe e iria gerar uma nova cobraça para o cliente, tendo duas agora.
- Como evitar que uma operação se repita caso algo falhe durante a execução assíncrona dentro de um serviço? Como evitar que essa chamada ao Stripe não acontece de novo?

- Solução: ID Potência
  - Todo pedido possuí um ID.
  - Stripe: olhar para o ID do pedido, e se já estiver feito o pagamento, não gerar novamente. Não processar novamente!
  - Microsserviços: são serviços (aplicações) toleráveis à falha. Vão falhar!
    - É necessário ter recursos para não reprocessar operações várias vezes.

- Problemática: como implementar uma transação que depende de vários serviços ao mesmo tempo?
  - Serviço de Stock: verificar se tem ou não;
  - Serviço de Credit: análise se o nome está limpo ou não;
  - Serviço de ...: realizar uma consulta...
- Um comando que é executado (uma aplicação - orders), que depende de vários outros serviços. Qual seria a melhor forma de chamar os serviços que validam o principal? Utilizar uma requisição Rest?

- Pattern de Saga
  - Não confundir com Redux Saga;
  - Transações (comando/requisição) que comtemplam múltiplos serviços, devem ser quebradas em microtransações:
    - No caso, ao tentar utilizar um serviço que cria um pedido. Na verdade, quebrar o serviço de `Orders`, emitindo para o `message broker` um "order.filled" (pedido preenchido).
    - O pedido preenchido será ouvido pelo sistema de Stock, que vai verificar se tem estoque ou não. E irá emitir outro evento: stock.available ou stock.unvailable.
    - Esses eventos serão ouvidos pelo nosso sistema de Orders, sendo possível alterar o status do pedido para `created`, por exemplo. Ou seja, ao invés de criar o pedido com status de `created`, cria como `pending`. 
  - Quebrar o serviço em serviço menores.

# Circuit Breaker: 
- Como evitar que um serviço impacte em outro serviço (lentidão)

## Problema:

1. Ponto de Falha Externa: A API dos Correios (um serviço externo que você não controla) fica lenta ou cai completamente.
2. Dependência Direta: Seu Serviço de Logística depende diretamente e de forma síncrona (ex: uma chamada HTTP bloqueante) dessa API. Ele fica "travado", esperando a resposta que nunca chega ou que leva uma eternidade.
3. Cascata de Falhas (Failure Cascade):
  - O Serviço de Nota Fiscal faz uma chamada síncrona para o Serviço de Logística (para pegar o valor do frete, por exemplo).
  - O Serviço de Nota Fiscal agora também fica travado, esperando a resposta do Serviço de Logística, que por sua vez está travado nos Correios.
4. Colapso Iminente:
  - Todas as threads do Serviço de Nota Fiscal podem ficar ocupadas, esperando.
  - Isso pode fazer com que o Serviço de Nota Fiscal também fique lento para todas as outras requisições que não envolvem logística.
  - O problema se propaga para o Serviço de Pedidos e, eventualmente, para o front-end, que timeouta ou mostra erro para o usuário final.
  - Um único ponto de falha externo derruba ou degrada gravemente toda a sua plataforma.

## Solução:
  - É um proxy, então o serviço de faturamento bate no circuit break (checa se tá tudo bem), já diz se o serviço de logística está ok. Se não, já diz, não se comunica, tá morrendo.
  - Detectar quando um serviço está com problema.
  - Parecido com rate limit.

# BFF (backend for frontend)
  - Busca vários dados de diversos serviços, e reune somente em um endpoint, um recurso como todo.
  - Por exemplo, um array de pedido, tendo dados do pedido, da fatura, data de entrega etc. Vários serviços sendo consumidos, mas retornando somente uma rota para o frontend.
  - Tendo várias aplicações, precisando buscar dados de várias dessas, podemos utilizar um GraphQL (Federation: vários APIs em uma só).

# Documentação
  - Event Catalog: https://www.eventcatalog.dev/