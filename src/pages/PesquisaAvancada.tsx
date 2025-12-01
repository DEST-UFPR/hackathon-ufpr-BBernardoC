import { useState } from "react";
import { Container } from "@mui/material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import FiltersPanel, {
  DashboardFilters,
} from "@/components/Dashboard/FiltersPanel";
import FilterComp from "@/components/DashboardPesquisa/FilterComp";
import ChartsSection from "@/components/Dashboard/ChartsSection";
import GraficoDuplo from "@/components/DashboardPesquisa/GrafComparativo";
import ComparisonCards from "@/components/DashboardPesquisa/MetricComp";
const PesquisaComparativa = () => {
  const [filtersLeft, setFiltersLeft] = useState<DashboardFilters>({
    setorCurso: [],
    curso: [],
    disciplina: [],
    pergunta: [],
    questionario: "Todos",
  });

  const [filtersRight, setFiltersRight] = useState<DashboardFilters>({
    setorCurso: [],
    curso: [],
    disciplina: [],
    pergunta: [],
    questionario: "Todos",
  });

  return (
    <DashboardLayout>
      <Container maxWidth={false} className="space-y-6">
        <FilterComp
          filtersLeft={filtersLeft}
          filtersRight={filtersRight}
          onFiltersLeftChange={setFiltersLeft}
          onFiltersRightChange={setFiltersRight}
        />

        <GraficoDuplo filtersLeft={filtersLeft} filtersRight={filtersRight} />
        <ComparisonCards
          filtersLeft={filtersLeft}
          filtersRight={filtersRight}
        />
      </Container>
    </DashboardLayout>
  );
};

export default PesquisaComparativa;
