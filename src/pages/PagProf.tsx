import { useState } from "react";
import { Container } from "@mui/material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import FiltersPanel, {
  DashboardFilters,
} from "@/components/Dashboard/FiltersPanel";
import ChartsSection from "@/components/Dashboard/ChartsSection";
import { DadoPesquisa } from "@/types/DadoPesquisa";

const Prof = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    tipoPesquisa: "disciplina_presencial",
    setorCurso: [],
    curso: [],
    disciplina: [],
    pergunta: [],
    lotacao: [],
  });
  const [dados, setDados] = useState<DadoPesquisa[]>([]);

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
  };

  return (
    <DashboardLayout>
      <Container maxWidth={false} className="space-y-6">
        <MetricsCards dados={dados} />

        <FiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onDadosChange={setDados}
        />

        <ChartsSection filters={filters} dados={dados} />
      </Container>
    </DashboardLayout>
  );
};

export default Prof;
