export interface DadoPesquisa {
  ID_PESQUISA: number;
  PERGUNTA: string;
  RESPOSTA: "Concordo" | "Discordo" | "Desconheço" | "Sim" | "Não";
  CURSO: string;
  SETOR_CURSO: string;
  NOME_DISCIPLINA: string;
  LOTACAO: string;
}
