import { useState } from "react";
import { Container } from "@mui/material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import FiltersPanel, {
  DashboardFilters,
} from "@/components/Dashboard/FiltersPanel";
import ChartsSection from "@/components/Dashboard/ChartsSection";

const Index = () => {
  const [filters, setFilters] = useState<DashboardFilters>({
    setorCurso: [],
    curso: [],
    disciplina: [],
    pergunta: [],
    questionario: "Todos",
  });

  const handleFiltersChange = (newFilters: DashboardFilters) => {
    setFilters(newFilters);
    console.log("Filtros aplicados:", newFilters);
  };

  return (
    <DashboardLayout>
      <Container maxWidth={false} className="space-y-6">
        <MetricsCards />

        <FiltersPanel filters={filters} onFiltersChange={handleFiltersChange} />

        <ChartsSection filters={filters} />
      </Container>
    </DashboardLayout>
  );
};

export default Index;
