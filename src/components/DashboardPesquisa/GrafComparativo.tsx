import { Box, Paper, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DashboardFilters } from "@/components/Dashboard/FiltersPanel";
import { transformarDadosPesquisa } from "@/utils/transformarDadosPesquisa";
import dadosReais from "@/utils/dados_disciplinaPresencial.json";
import { DadoPesquisa } from "@/types/DadoPesquisa";

// ================= TOOLTIP CUSTOMIZADO =================
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;

  const dados = payload[0].payload;

  const respostasOriginais = [
    "Concordo",
    "Sim",
    "Desconheço",
    "Discordo",
    "Não",
  ];

  return (
    <div
      style={{
        backgroundColor: "white",
        padding: "12px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      <p
        style={{
          fontWeight: "bold",
          marginBottom: "8px",
          whiteSpace: "normal",
          wordWrap: "break-word",
          lineHeight: "1.4",
        }}
      >
        {label}
      </p>

      {respostasOriginais.map((resposta) => {
        const percentual = dados[resposta] || 0;
        const quantidade = dados[`${resposta}_qtd`] || 0;

        if (percentual === 0) return null;

        return (
          <p
            key={resposta}
            style={{
              fontSize: "14px",
              margin: "4px 0",
              color:
                resposta === "Concordo" || resposta === "Sim"
                  ? "#2E7D32"
                  : resposta === "Desconheço"
                  ? "#616161"
                  : "#e61212ff",
            }}
          >
            {resposta}: {percentual.toFixed(2)}% ({quantidade} respostas)
          </p>
        );
      })}
    </div>
  );
};

// ================= COMPONENTE DE GRÁFICO INDIVIDUAL =================
interface GraficoIndividualProps {
  filters: DashboardFilters;
  title: string;
}

function GraficoIndividual({ filters, title }: GraficoIndividualProps) {
  const dados = dadosReais as DadoPesquisa[];

  const dadosFiltrados = dados.filter((item) => {
    const setorMatch =
      filters.setorCurso.length === 0 ||
      filters.setorCurso.includes(item.setorCurso);

    const cursoMatch =
      filters.curso.length === 0 || filters.curso.includes(item.curso);

    const disciplinaMatch =
      filters.disciplina.length === 0 ||
      filters.disciplina.includes(item.disciplina);

    const perguntaMatch =
      filters.pergunta.length === 0 || filters.pergunta.includes(item.pergunta);

    return setorMatch && cursoMatch && disciplinaMatch && perguntaMatch;
  });

  const dadosGraficoOriginal = transformarDadosPesquisa(dadosFiltrados);

  // ===== LISTA COMPLETA DE PERGUNTAS (para manter índice correto) =====
  const todasPerguntas = Array.from(new Set(dados.map((d) => d.pergunta)));

  // ===== AGRUPAMENTO DAS RESPOSTAS =====
  const dadosGrafico = dadosGraficoOriginal.map((item: any) => {
    const positivo = (item.Concordo || 0) + (item.Sim || 0);
    const negativo = (item.Discordo || 0) + (item["Não"] || 0);
    const neutro = item.Desconheço || 0;

    // Encontra o índice original da pergunta
    const indiceOriginal = todasPerguntas.indexOf(item.pergunta);

    return {
      ...item,
      indiceOriginal, // Adiciona o índice original
      Positivo: Number(positivo.toFixed(2)),
      Neutro: Number(neutro.toFixed(2)),
      Negativo: Number(negativo.toFixed(2)),

      Positivo_qtd: (item.Concordo_qtd || 0) + (item.Sim_qtd || 0),
      Negativo_qtd: (item.Discordo_qtd || 0) + (item["Não_qtd"] || 0),
      Neutro_qtd: item.Desconheço_qtd || 0,
    };
  });

  const ORDEM_RESPOSTAS = ["Positivo", "Neutro", "Negativo"];

  const CORES_MAP: Record<string, string> = {
    Positivo: "#18a41cff",
    Neutro: "#BDBDBD",
    Negativo: "#f30c0cff",
  };

  const respostasUnicas = ORDEM_RESPOSTAS.filter((resposta) =>
    dadosGrafico.some((item) => item[resposta] && item[resposta] > 0)
  );

  return (
    <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom color="primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Distribuição percentual das respostas por pergunta (%)
      </Typography>

      {dadosGrafico.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          py={8}
        >
          Nenhum dado encontrado com os filtros selecionados.
        </Typography>
      ) : (
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={dadosGrafico} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v.toFixed(2)}%`}
            />

            <YAxis
              type="category"
              dataKey="pergunta"
              tickFormatter={(v, index) => {
                const item = dadosGrafico.find((d) => d.pergunta === v);
                return item ? `Q${item.indiceOriginal + 1}` : `Q${index + 1}`;
              }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {respostasUnicas.map((resposta) => (
              <Bar
                key={resposta}
                dataKey={resposta}
                stackId="a"
                fill={CORES_MAP[resposta]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Paper>
  );
}

// ================= COMPONENTE PRINCIPAL =================
interface Props {
  filtersLeft: DashboardFilters;
  filtersRight: DashboardFilters;
}

export default function GraficoDuplo({ filtersLeft, filtersRight }: Props) {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", lg: "1fr 1fr" }}
        gap={3}
      >
        {/* GRÁFICO ESQUERDO */}
        <GraficoIndividual filters={filtersLeft} title="Gráfico 1" />

        {/* GRÁFICO DIREITO */}
        <GraficoIndividual filters={filtersRight} title="Gráfico 2" />
      </Box>
    </Box>
  );
}
