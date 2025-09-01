import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider
} from "fastify-type-provider-zod";
import { z } from "zod";

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setSerializerCompiler(serializerCompiler);
app.setValidatorCompiler(validatorCompiler);

/*
  - Escalonamento horizontal
    - Novos servidores rodando a aplicação: Maq1 / Maq2 (load balance: enviar dados)

  - Deploy: Blue-green deployment (realiza a transfência de usuários)
    - Versões diferentes rodando, mas não pode matar a primeira;
    - Ver01 = 100%
    - Ver02 = 0%
*/
app.get("/health", () => {
  return "OK";
})

app.post("/orders", {
  schema: {
    body: z.object({
      amount: z.number()
    })
  }
}, (request, reply) => {
  const { amount } = request.body;

  console.log("Creating an order with amount: ", amount);
  return reply.status(201).send();
})

app.listen({ host: "0.0.0.0", port: 3333 }).then(() => {
  console.log("Server is running on port 3333");
});
