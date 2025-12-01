import { Paper, Typography, Box } from "@mui/material";
import { Assessment, School, MenuBook, TrendingUp } from "@mui/icons-material";
import { transformarDadosPesquisa } from "@/utils/transformarDadosPesquisa";
import dadosReais from "@/utils/dados_disciplinaPresencial.json";
import { DadoPesquisa } from "@/types/DadoPesquisa";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "primary" | "accent" | "warning" | "secondary";
}

const MetricCard = ({ title, value, icon, color }: MetricCardProps) => {
  const colorClasses = {
    primary: "bg-primary-light text-primary",
    accent: "bg-accent-light text-accent",
    warning: "bg-warning-light text-warning",
    secondary: "bg-secondary text-secondary-foreground",
  };

  return (
    <Paper
      elevation={0}
      className="p-6 border border-border rounded-xl hover:shadow-lg transition-all"
    >
      <Box className="flex items-start justify-between">
        <Box>
          <Typography
            variant="body2"
            className="text-muted-foreground mb-2 font-medium"
          >
            {title}
          </Typography>
          <Typography variant="h4" className="font-bold text-foreground">
            {value}
          </Typography>
        </Box>
        <Box className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</Box>
      </Box>
    </Paper>
  );
};

export const MetricsCards = () => {
  const dados = dadosReais as DadoPesquisa[];

  const dadosTransformados = transformarDadosPesquisa(dados);

  // Total de pesquisas (unique por pergunta)
  // Total de respostas (registros reais)
  const totalRespostas = dados.length;

  // Cursos únicos
  const totalCursos = new Set(dados.map((d) => d.curso)).size;

  // Disciplinas únicas
  const totalDisciplinas = new Set(dados.map((d) => d.disciplina)).size;

  const totalPessoas = new Set(dados.map((d) => d.id_pesquisa)).size;

  // Cálculo de aprovação (% Positivo)
  let somaPositivo = 0;
  let somaTotal = 0;

  dadosTransformados.forEach((item: any) => {
    const positivo = (item.Concordo_qtd || 0) + (item.Sim_qtd || 0);
    const negativo = (item.Discordo_qtd || 0) + (item.Não_qtd || 0);
    const neutro = item.Desconheço_qtd || 0;

    somaPositivo += positivo;
    somaTotal += positivo + negativo + neutro;
    console.log({ somaPositivo, somaTotal, positivo, negativo, neutro });
  });
  console.log(dadosTransformados);
  console.log(somaPositivo, somaTotal, totalRespostas);
  const taxaAprovacao =
    somaTotal === 0 ? 0 : ((somaPositivo / somaTotal) * 100).toFixed(2);

  const metrics = [
    {
      title: "Total de Perguntas Avaliadas",
      value: totalRespostas,
      icon: <Assessment className="w-6 h-6" />,
      color: "primary" as const,
    },
    {
      title: "Taxa de Aprovação",
      value: `${taxaAprovacao}%`,
      icon: <TrendingUp className="w-6 h-6" />,
      color: "accent" as const,
    },
    {
      title: "Pessoas Unicas Avaliadas",
      value: totalPessoas,
      icon: <School className="w-6 h-6" />,
      color: "warning" as const,
    },
    {
      title: "Disciplinas Avaliadas",
      value: totalDisciplinas,
      icon: <MenuBook className="w-6 h-6" />,
      color: "secondary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
};
