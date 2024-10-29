// Definindo a classe Agendamento
const Agendamento = Parse.Object.extend("Agendamento");

/* Criar Agendamento */
Parse.Cloud.define("criar-agendamento", async (req) => {
  const { bloco, apartamento, dataAgendamento, idPostgre } = req.params;
  if (!bloco || !apartamento || !dataAgendamento || !idPostgre) {
    throw "Campos obrigatórios não fornecidos";
  }

  const agendamento = new Agendamento();
  agendamento.set("bloco", bloco);
  agendamento.set("apartamento", apartamento);
  agendamento.set("dataAgendamento", new Date(dataAgendamento));
  agendamento.set("idPostgre", idPostgre);  // Adicionando o idPostgre

  try {
    const savedAgendamento = await agendamento.save(null, { useMasterKey: true });
    return { id: savedAgendamento.id, message: "Agendamento criado com sucesso!" };
  } catch (error) {
    throw `Erro ao criar agendamento: ${error.message}`;
  }
});

/* Listar Agendamentos por Data */
/* Parse.Cloud.define("listar-agendamentos-por-data", async (req) => {
  const { data } = req.params;
  
  if (!data) throw "Data não fornecida";
  const dataQuery = new Date(data)

  const query = new Parse.Query(Agendamento);
  query.equalTo("dataAgendamento", dataQuery);
  query.limit(1000);

  try {
    const agendamentos = await query.find({ useMasterKey: true });
    return agendamentos.map((agendamento) => agendamento.toJSON());
  } catch (error) {
    throw `Erro ao listar agendamentos: ${error.message}`;
  }
}); */

/* Listar Agendamentos por Data */
Parse.Cloud.define("listar-agendamentos-por-data", async (req) => {
  const { data } = req.params;

  if (!data) throw "Data não fornecida";
  
  // Cria um objeto Date com a data fornecida
  const dataQuery = new Date(data);
  
  // Ajusta para o fuso horário de Brasília (UTC-3 ou UTC-2 no horário de verão)
  const utcOffset = -3; // Para UTC-3
  const startOfDay = new Date(dataQuery.getUTCFullYear(), dataQuery.getUTCMonth(), dataQuery.getUTCDate(), 0, 0, 0);
  const endOfDay = new Date(dataQuery.getUTCFullYear(), dataQuery.getUTCMonth(), dataQuery.getUTCDate(), 23, 59, 59, 999);

  // Aplica o offset de Brasília
  startOfDay.setHours(startOfDay.getHours() + utcOffset);
  endOfDay.setHours(endOfDay.getHours() + utcOffset);

  const query = new Parse.Query(Agendamento);
  // Busca agendamentos dentro do intervalo de um dia
  query.greaterThanOrEqualTo("dataAgendamento", startOfDay);
  query.lessThanOrEqualTo("dataAgendamento", endOfDay);
  query.limit(1000);

  try {
      const agendamentos = await query.find({ useMasterKey: true });
      return agendamentos.map((agendamento) => agendamento.toJSON());
  } catch (error) {
      throw `Erro ao listar agendamentos: ${error.message}`;
  }
});

/* Deletar Agendamento */
Parse.Cloud.define("deletar-agendamento", async (req) => {
  let { idPostgre } = req.params;  // Recebe idPostgre dos parâmetros

  if (!idPostgre) {
      throw "ID do agendamento não fornecido";
  }

  // Verificar se idPostgre é uma string que pode ser convertida em número
  if (typeof idPostgre === "string") {
      idPostgre = parseInt(idPostgre, 10);  // Converte para número
  }

  if (isNaN(idPostgre)) {
      throw "ID do agendamento deve ser um número válido";
  }

  const query = new Parse.Query("Agendamento");
  query.equalTo("idPostgre", idPostgre);  // Busca o agendamento pelo idPostgre

  try {
      const agendamento = await query.first({ useMasterKey: true });
      if (!agendamento) {
          throw new Parse.Error(Parse.Error.OBJECT_NOT_FOUND, "Agendamento não encontrado");
      }

      await agendamento.destroy({ useMasterKey: true });
      return { message: "Agendamento excluído com sucesso!" };
  } catch (error) {
      throw new Parse.Error(Parse.Error.INTERNAL_SERVER_ERROR, `Erro ao deletar agendamento: ${error.message || 'Erro desconhecido'}`);
  }
});




