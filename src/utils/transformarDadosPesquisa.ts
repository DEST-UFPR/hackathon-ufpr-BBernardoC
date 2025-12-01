import { DadoPesquisa } from "@/types/DadoPesquisa";

export interface DadoGraficoPergunta {
  pergunta: string;
  [resposta: string]:
    | number
    | string
    | { percentual: number; quantidade: number };
}

export function transformarDadosPesquisa(
  dados: DadoPesquisa[]
): DadoGraficoPergunta[] {
  const mapa = new Map<string, Map<number, string>>();

  dados.forEach((item) => {
    if (!mapa.has(item.pergunta)) {
      mapa.set(item.pergunta, new Map());
    }
    mapa.get(item.pergunta)!.set(item.id_pesquisa, item.resposta);
  });

  const resultado: DadoGraficoPergunta[] = [];

  mapa.forEach((respostasPorPesquisa, pergunta) => {
    const contagem: Record<string, number> = {};
    const total = respostasPorPesquisa.size;

    respostasPorPesquisa.forEach((resposta) => {
      contagem[resposta] = (contagem[resposta] || 0) + 1;
    });

    const dadosPergunta: DadoGraficoPergunta = { pergunta };

    const entradas = Object.entries(contagem);
    let soma = 0;

    entradas.forEach(([resposta, qtd], index) => {
      const valor = (qtd / total) * 100;
      let arredondado = Number(valor.toFixed(2));

      // Último item fecha exatamente em 100%
      if (index === entradas.length - 1) {
        arredondado = Number((100 - soma).toFixed(2));
      }

      // Armazena o percentual (para o gráfico usar)
      dadosPergunta[resposta] = arredondado;

      // Armazena a quantidade absoluta com sufixo "_qtd"
      dadosPergunta[`${resposta}_qtd`] = qtd;

      soma += arredondado;
    });

    resultado.push(dadosPergunta);
  });
  console.log("Dados transformados para gráfico:", resultado);
  return resultado;
}
