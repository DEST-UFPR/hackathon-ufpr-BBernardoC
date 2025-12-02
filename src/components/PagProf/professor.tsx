import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Typography,
  Paper,
  Autocomplete,
  TextField,
  Divider,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Assessment,
  People,
  MenuBook,
  Person,
} from "@mui/icons-material";
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
import { DadoPesquisa } from "@/types/DadoPesquisa";
import { transformarDadosPesquisa } from "@/utils/transformarDadosPesquisa";

// ================= MAPEAMENTO DOS TIPOS =================
const TIPOS_PESQUISA = [
  { label: "Disciplina Presencial", value: "disciplina_presencial" },
  { label: "Disciplina EAD", value: "disciplina_ead" },
];

// ================= INTERFACE =================
export interface ProfessorFilters {
  tipoPesquisa: string;
  professor: string[];
  curso: string[];
  disciplina: string[];
  pergunta: string[];
}

interface MetricData {
  totalRespostas: number;
  taxaAprovacao: number;
  totalPessoas: number;
  totalDisciplinas: number;
  totalCursos: number;
}

// ================= FILTROS =================
interface FiltersPanelProps {
  filters: ProfessorFilters;
  onFiltersChange: (filters: ProfessorFilters) => void;
  onDadosChange: (dados: DadoPesquisa[]) => void;
}

function FiltersPanel({
  filters,
  onFiltersChange,
  onDadosChange,
}: FiltersPanelProps) {
  const [dados, setDados] = useState<DadoPesquisa[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega o JSON quando o tipo muda
  useEffect(() => {
    if (!filters.tipoPesquisa) {
      setDados([]);
      onDadosChange([]);
      return;
    }

    setLoading(true);

    import(`../../../cache/${filters.tipoPesquisa}.json`)
      .then((module) => {
        const dadosCarregados = module.default as DadoPesquisa[];
        setDados(dadosCarregados);
        onDadosChange(dadosCarregados);
      })
      .catch((error) => {
        console.error(`Erro ao carregar ${filters.tipoPesquisa}.json:`, error);
        setDados([]);
        onDadosChange([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters.tipoPesquisa, onDadosChange]);

  const handleChange = (
    field: keyof ProfessorFilters,
    value: string | string[]
  ) => {
    const updated = { ...filters, [field]: value };

    // 🔁 RESET EM CASCATA
    if (field === "tipoPesquisa") {
      updated.professor = [];
      updated.curso = [];
      updated.disciplina = [];
      updated.pergunta = [];
    }

    if (field === "professor") {
      updated.curso = [];
      updated.disciplina = [];
      updated.pergunta = [];
    }

    if (field === "curso") {
      updated.disciplina = [];
      updated.pergunta = [];
    }

    if (field === "disciplina") {
      updated.pergunta = [];
    }

    onFiltersChange(updated);
  };

  // ✅ PROFESSORES
  const professores = Array.from(
    new Set(dados.map((d) => d.CODPROF).filter(Boolean))
  ).sort();

  // ✅ CURSOS BASEADOS NO PROFESSOR
  const cursos =
    filters.professor.length === 0
      ? []
      : Array.from(
          new Set(
            dados
              .filter((d) => filters.professor.includes(d.CODPROF))
              .map((d) => d.CURSO)
          )
        ).sort();

  // ✅ DISCIPLINAS BASEADAS EM PROFESSOR + CURSO
  const disciplinas =
    filters.curso.length === 0
      ? []
      : Array.from(
          new Set(
            dados
              .filter(
                (d) =>
                  filters.professor.includes(d.CODPROF) &&
                  filters.curso.includes(d.CURSO)
              )
              .map((d) => d.NOME_DISCIPLINA)
          )
        ).sort();

  // ✅ PERGUNTAS DINÂMICAS
  const perguntas = Array.from(
    new Set(
      dados
        .filter((d) => {
          const professorMatch =
            filters.professor.length === 0 ||
            filters.professor.includes(d.CODPROF);

          const cursoMatch =
            filters.curso.length === 0 || filters.curso.includes(d.CURSO);

          const disciplinaMatch =
            filters.disciplina.length === 0 ||
            filters.disciplina.includes(d.NOME_DISCIPLINA);

          return professorMatch && cursoMatch && disciplinaMatch;
        })
        .map((d) => d.PERGUNTA)
    )
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary" mb={3}>
        Filtros - Análise por Professor
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap">
        {/* TIPO DE PESQUISA */}
        <Autocomplete
          options={TIPOS_PESQUISA}
          value={
            TIPOS_PESQUISA.find((t) => t.value === filters.tipoPesquisa) || null
          }
          onChange={(_, value) =>
            handleChange("tipoPesquisa", value?.value || "")
          }
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Tipo de Pesquisa"
              size="small"
              required
            />
          )}
          disabled={loading}
          sx={{ minWidth: 220 }}
        />

        {/* PROFESSOR */}
        <Autocomplete
          multiple
          options={professores}
          value={filters.professor}
          onChange={(_, value) => handleChange("professor", value)}
          disabled={
            !filters.tipoPesquisa || loading || professores.length === 0
          }
          renderInput={(params) => (
            <TextField {...params} label="Professor" size="small" />
          )}
          ChipProps={{ size: "small" }}
          sx={{ minWidth: 280 }}
        />

        {/* CURSO */}
        <Autocomplete
          multiple
          options={cursos}
          value={filters.curso}
          onChange={(_, value) => handleChange("curso", value)}
          disabled={cursos.length === 0}
          renderInput={(params) => (
            <TextField {...params} label="Curso" size="small" />
          )}
          ChipProps={{ size: "small" }}
          sx={{ minWidth: 220 }}
        />

        {/* DISCIPLINA */}
        <Autocomplete
          multiple
          options={disciplinas}
          value={filters.disciplina}
          onChange={(_, value) => handleChange("disciplina", value)}
          disabled={disciplinas.length === 0}
          renderInput={(params) => (
            <TextField {...params} label="Disciplina" size="small" />
          )}
          ChipProps={{ size: "small" }}
          sx={{ minWidth: 220 }}
        />

        {/* PERGUNTAS */}
        <Autocomplete
          multiple
          options={perguntas}
          value={filters.pergunta}
          onChange={(_, value) => handleChange("pergunta", value)}
          disabled={!filters.tipoPesquisa || loading}
          getOptionLabel={(option) => {
            const index = perguntas.indexOf(option);
            return `Q${index + 1} - ${option}`;
          }}
          renderInput={(params) => (
            <TextField {...params} label="Perguntas" size="small" />
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              const perguntaIndex = perguntas.indexOf(option);
              return (
                <Chip
                  key={key}
                  {...tagProps}
                  label={`Q${perguntaIndex + 1}`}
                  title={option}
                  size="small"
                />
              );
            })
          }
          ListboxProps={{
            style: { maxHeight: 300 },
          }}
          sx={{ minWidth: 320 }}
        />

        {/* BOTÃO LIMPAR */}
        <Button
          variant="outlined"
          onClick={() =>
            onFiltersChange({
              tipoPesquisa: "",
              professor: [],
              curso: [],
              disciplina: [],
              pergunta: [],
            })
          }
          sx={{ height: 40 }}
        >
          Limpar filtros
        </Button>
      </Box>
    </Paper>
  );
}

// ================= CALCULA MÉTRICAS =================
function calcularMetricas(
  filters: ProfessorFilters,
  dados: DadoPesquisa[]
): MetricData {
  const dadosFiltrados = dados.filter((item) => {
    const professorMatch =
      filters.professor.length === 0 ||
      filters.professor.includes(item.CODPROF);

    const cursoMatch =
      filters.curso.length === 0 || filters.curso.includes(item.CURSO);

    const disciplinaMatch =
      filters.disciplina.length === 0 ||
      filters.disciplina.includes(item.NOME_DISCIPLINA);

    const perguntaMatch =
      filters.pergunta.length === 0 || filters.pergunta.includes(item.PERGUNTA);

    return professorMatch && cursoMatch && disciplinaMatch && perguntaMatch;
  });

  const totalRespostas = dadosFiltrados.length;

  const totalCursos = new Set(dadosFiltrados.map((d) => d.CURSO)).size;

  const totalDisciplinas = new Set(dadosFiltrados.map((d) => d.NOME_DISCIPLINA))
    .size;

  const totalPessoas = new Set(dadosFiltrados.map((d) => d.ID_PESQUISA)).size;

  // Taxa de aprovação
  let somaPositivo = 0;
  let somaTotal = 0;

  dadosFiltrados.forEach((d) => {
    if (d.RESPOSTA) {
      somaTotal++;
      if (d.RESPOSTA === "Concordo" || d.RESPOSTA === "Sim") {
        somaPositivo++;
      }
    }
  });

  const taxaAprovacao = somaTotal === 0 ? 0 : (somaPositivo / somaTotal) * 100;

  return {
    totalRespostas,
    taxaAprovacao,
    totalPessoas,
    totalDisciplinas,
    totalCursos,
  };
}

// ================= CARD DE MÉTRICA (ESTILO COMPARISON) =================
interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  isPercentage?: boolean;
}

function MetricCard({
  title,
  value,
  icon,
  isPercentage = false,
}: MetricCardProps) {
  const formatValue = (val: number) => {
    return isPercentage ? `${val.toFixed(2)}%` : val.toLocaleString();
  };

  return (
    <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Box sx={{ color: "primary.main" }}>{icon}</Box>
        <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
          {title}
        </Typography>
      </Box>

      <Typography variant="h5" fontWeight="bold">
        {formatValue(value)}
      </Typography>
    </Paper>
  );
}

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

// ================= COMPONENTE DE GRÁFICO =================
interface GraficoProps {
  filters: ProfessorFilters;
  dados: DadoPesquisa[];
}

function GraficoProfessor({ filters, dados }: GraficoProps) {
  if (!dados || dados.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Distribuição percentual das respostas por pergunta (%)
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          py={8}
        >
          Selecione um tipo de pesquisa para visualizar os dados.
        </Typography>
      </Paper>
    );
  }

  const dadosFiltrados = dados.filter((item) => {
    const professorMatch =
      filters.professor.length === 0 ||
      filters.professor.includes(item.CODPROF);

    const cursoMatch =
      filters.curso.length === 0 || filters.curso.includes(item.CURSO);

    const disciplinaMatch =
      filters.disciplina.length === 0 ||
      filters.disciplina.includes(item.NOME_DISCIPLINA);

    const perguntaMatch =
      filters.pergunta.length === 0 || filters.pergunta.includes(item.PERGUNTA);

    return professorMatch && cursoMatch && disciplinaMatch && perguntaMatch;
  });

  const dadosGraficoOriginal = transformarDadosPesquisa(dadosFiltrados);

  const todasPerguntas = Array.from(new Set(dados.map((d) => d.PERGUNTA)));

  const dadosGrafico = dadosGraficoOriginal.map((item: any) => {
    const positivo = (item.Concordo || 0) + (item.Sim || 0);
    const negativo = (item.Discordo || 0) + (item["Não"] || 0);
    const neutro = item.Desconheço || 0;

    const indiceOriginal = todasPerguntas.indexOf(item.pergunta);

    return {
      ...item,
      indiceOriginal,
      Positivo: Number(positivo.toFixed(2)),
      Neutro: Number(neutro.toFixed(2)),
      Negativo: Number(negativo.toFixed(2)),

      Positivo_qtd: (item.Concordo_qtd || 0) + (item.Sim_qtd || 0),
      Negativo_qtd: (item.Discordo_qtd || 0) + (item["Não_qtd"] || 0),
      Neutro_qtd: item.Desconheço_qtd || 0,
    };
  });

  const ORDEM_RESPOSTAS = ["Positivo", "Desconheço", "Negativo"];

  const CORES_MAP: Record<string, string> = {
    Positivo: "#18a41cff",
    Desconheço: "#BDBDBD",
    Negativo: "#f30c0cff",
  };

  const respostasUnicas = ORDEM_RESPOSTAS.filter((resposta) =>
    dadosGrafico.some((item) => item[resposta] && item[resposta] > 0)
  );

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" mb={2}>
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
export default function ProfessorDashboard() {
  const [filters, setFilters] = useState<ProfessorFilters>({
    tipoPesquisa: "",
    professor: [],
    curso: [],
    disciplina: [],
    pergunta: [],
  });

  const [dados, setDados] = useState<DadoPesquisa[]>([]);

  const metrics = calcularMetricas(filters, dados);

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Filtros */}
      <FiltersPanel
        filters={filters}
        onFiltersChange={setFilters}
        onDadosChange={setDados}
      />

      {/* Métricas */}
      <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
        Métricas por Professor
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          lg: "repeat(5, 1fr)",
        }}
        gap={3}
        mb={3}
      >
        <MetricCard
          title="Taxa de Aprovação"
          value={metrics.taxaAprovacao}
          icon={<TrendingUp />}
          isPercentage
        />

        <MetricCard
          title="Cursos"
          value={metrics.totalCursos}
          icon={<MenuBook />}
        />

        <MetricCard
          title="Disciplinas"
          value={metrics.totalDisciplinas}
          icon={<MenuBook />}
        />

        <MetricCard
          title="Pessoas Avaliadas"
          value={metrics.totalPessoas}
          icon={<People />}
        />

        <MetricCard
          title="Total de Respostas"
          value={metrics.totalRespostas}
          icon={<Assessment />}
        />
      </Box>

      {/* Gráfico */}
      <GraficoProfessor filters={filters} dados={dados} />
    </Box>
  );
}
