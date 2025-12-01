import { Paper, Typography, Box, Divider } from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  Remove,
  Assessment,
  School,
  MenuBook,
  People,
} from "@mui/icons-material";
import { DashboardFilters } from "@/components/Dashboard/FiltersPanel";
import { transformarDadosPesquisa } from "@/utils/transformarDadosPesquisa";
import dadosReais from "@/utils/dados_disciplinaPresencial.json";
import { DadoPesquisa } from "@/types/DadoPesquisa";

interface Props {
  filtersLeft: DashboardFilters;
  filtersRight: DashboardFilters;
}

interface MetricData {
  totalRespostas: number;
  taxaAprovacao: number;
  totalPessoas: number;
  totalDisciplinas: number;
  totalCursos: number;
}

// ================= CALCULA MÉTRICAS =================
function calcularMetricas(filters: DashboardFilters): MetricData {
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

  const dadosTransformados = transformarDadosPesquisa(dadosFiltrados);

  const totalRespostas = dadosFiltrados.length;
  const totalCursos = new Set(dadosFiltrados.map((d) => d.curso)).size;
  const totalDisciplinas = new Set(dadosFiltrados.map((d) => d.disciplina))
    .size;
  const totalPessoas = new Set(dadosFiltrados.map((d) => d.id_pesquisa)).size;

  let somaPositivo = 0;
  let somaTotal = 0;

  dadosTransformados.forEach((item: any) => {
    const positivo = (item.Concordo_qtd || 0) + (item.Sim_qtd || 0);
    const negativo = (item.Discordo_qtd || 0) + (item.Não_qtd || 0);
    const neutro = item.Desconheço_qtd || 0;

    somaPositivo += positivo;
    somaTotal += positivo + negativo + neutro;
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
export default function ComparisonCards({ filtersLeft, filtersRight }: Props) {
  const metricsLeft = calcularMetricas(filtersLeft);
  const metricsRight = calcularMetricas(filtersRight);

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
          title="Total de Respostas"
          valueLeft={metricsLeft.totalRespostas}
          valueRight={metricsRight.totalRespostas}
          icon={<Assessment />}
        />

        <ComparisonCard
          title="Pessoas Avaliadas"
          valueLeft={metricsLeft.totalPessoas}
          valueRight={metricsRight.totalPessoas}
          icon={<People />}
        />

        <ComparisonCard
          title="Disciplinas"
          valueLeft={metricsLeft.totalDisciplinas}
          valueRight={metricsRight.totalDisciplinas}
          icon={<MenuBook />}
        />
      </Box>
    </Box>
  );
}
