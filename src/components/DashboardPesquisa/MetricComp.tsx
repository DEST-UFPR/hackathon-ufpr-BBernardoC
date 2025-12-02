import { Paper, Typography, Box, Divider } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Assessment,
  People,
  MenuBook,
} from "@mui/icons-material";

import { DashboardFilters } from "@/components/Dashboard/FiltersPanel";
import { DadoPesquisa } from "@/types/DadoPesquisa";

interface Props {
  filtersLeft: DashboardFilters;
  filtersRight: DashboardFilters;
  dadosLeft: DadoPesquisa[]; // ✅ NOVO!
  dadosRight: DadoPesquisa[]; // ✅ NOVO!
}

interface MetricData {
  totalRespostas: number;
  taxaAprovacao: number;
  totalPessoas: number;
  totalDisciplinas: number;
  totalCursos: number;
}

// ================= CALCULA MÉTRICAS =================
function calcularMetricas(
  filters: DashboardFilters,
  dados: DadoPesquisa[] // ✅ RECEBE OS DADOS CORRETOS
): MetricData {
  const isInstitucional = filters.tipoPesquisa === "institucional";

  const dadosFiltrados = dados.filter((item) => {
    const setorMatch =
      filters.setorCurso.length === 0 ||
      filters.setorCurso.includes(item.SETOR_CURSO);

    const cursoOuLotacaoMatch = isInstitucional
      ? filters.lotacao.length === 0 ||
        filters.lotacao.includes(item.LOTACAO || "")
      : filters.curso.length === 0 || filters.curso.includes(item.CURSO);

    const disciplinaMatch = isInstitucional
      ? true
      : filters.disciplina.length === 0 ||
        filters.disciplina.includes(item.NOME_DISCIPLINA);

    const perguntaMatch =
      filters.pergunta.length === 0 || filters.pergunta.includes(item.PERGUNTA);

    return (
      setorMatch && cursoOuLotacaoMatch && disciplinaMatch && perguntaMatch
    );
  });

  // ====== MÉTRICAS DIRETAS (SEM AGRUPAR) ======

  const totalRespostas = dadosFiltrados.length;

  const totalCursos = isInstitucional
    ? new Set(dadosFiltrados.map((d) => d.LOTACAO).filter(Boolean)).size
    : new Set(dadosFiltrados.map((d) => d.CURSO)).size;

  const totalDisciplinas = isInstitucional
    ? 0
    : new Set(dadosFiltrados.map((d) => d.NOME_DISCIPLINA)).size;

  const totalPessoas = new Set(dadosFiltrados.map((d) => d.ID_PESQUISA)).size;

  // ====== TAXA DE APROVAÇÃO CORRETA ======
  let somaPositivo = 0;
  let somaTotal = 0;

  dadosFiltrados.forEach((d) => {
    // só conta se o item tiver RESPOSTA válida
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

// ================= CARD DE COMPARAÇÃO =================
interface ComparisonCardProps {
  title: string;
  valueLeft: number;
  valueRight: number;
  icon: React.ReactNode;
  isPercentage?: boolean;
}

function ComparisonCard({
  title,
  valueLeft,
  valueRight,
  icon,
  isPercentage = false,
}: ComparisonCardProps) {
  const difference = valueRight - valueLeft;
  const percentDiff =
    valueLeft === 0 ? 0 : ((difference / valueLeft) * 100).toFixed(1);

  const getTrendIcon = () => {
    if (difference > 0) return <TrendingUp className="w-5 h-5" />;
    if (difference < 0) return <TrendingDown className="w-5 h-5" />;
    return <Remove className="w-5 h-5" />;
  };

  const getTrendColor = () => {
    if (difference > 0) return "text-green-600";
    if (difference < 0) return "text-red-600";
    return "text-gray-500";
  };

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

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Gráfico 1
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatValue(valueLeft)}
          </Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

        <Box>
          <Typography variant="caption" color="text.secondary">
            Gráfico 2
          </Typography>
          <Typography variant="h5" fontWeight="bold">
            {formatValue(valueRight)}
          </Typography>
        </Box>
      </Box>

      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor:
            difference === 0
              ? "grey.100"
              : difference > 0
              ? "green.50"
              : "red.50",
        }}
      >
        <Box className={getTrendColor()}>{getTrendIcon()}</Box>
        <Box>
          <Typography
            variant="body2"
            className={getTrendColor()}
            fontWeight={600}
          >
            {difference > 0 ? "+" : ""}
            {formatValue(difference)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {difference === 0
              ? "Sem diferença"
              : `${percentDiff > 0 ? "+" : ""}${percentDiff}% vs Gráfico 1`}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

// ================= COMPONENTE PRINCIPAL =================
export default function ComparisonCards({
  filtersLeft,
  filtersRight,
  dadosLeft,
  dadosRight,
}: Props) {
  // ✅ Passa os dados corretos para cada lado
  const metricsLeft = calcularMetricas(filtersLeft, dadosLeft);
  const metricsRight = calcularMetricas(filtersRight, dadosRight);

  const isInstitucional = filtersLeft.tipoPesquisa === "institucional";

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom mb={3}>
        Comparação de Métricas
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          lg: "repeat(4, 1fr)",
        }}
        gap={3}
      >
        <ComparisonCard
          title="Taxa de Aprovação"
          valueLeft={metricsLeft.taxaAprovacao}
          valueRight={metricsRight.taxaAprovacao}
          icon={<TrendingUp />}
          isPercentage
        />

        <ComparisonCard
          title={isInstitucional ? "Lotação" : "Cursos"}
          valueLeft={metricsLeft.totalCursos}
          valueRight={metricsRight.totalCursos}
          icon={<MenuBook />}
        />

        {!isInstitucional && (
          <ComparisonCard
            title="Disciplinas"
            valueLeft={metricsLeft.totalDisciplinas}
            valueRight={metricsRight.totalDisciplinas}
            icon={<MenuBook />}
          />
        )}

        <ComparisonCard
          title="Pessoas Avaliadas"
          valueLeft={metricsLeft.totalPessoas}
          valueRight={metricsRight.totalPessoas}
          icon={<People />}
        />

        <ComparisonCard
          title="Total de Respostas"
          valueLeft={metricsLeft.totalRespostas}
          valueRight={metricsRight.totalRespostas}
          icon={<Assessment />}
        />
      </Box>
    </Box>
  );
}
