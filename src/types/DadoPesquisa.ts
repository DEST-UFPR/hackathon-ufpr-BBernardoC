export interface DadoPesquisa {
  id_pesquisa: number;
  pergunta: string;
  resposta: "Concordo" | "Discordo" | "Desconheço" | "Sim" | "Não";
  curso: string;
  setorCurso: string;
  disciplina: string;
}
