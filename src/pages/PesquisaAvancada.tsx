import { useState } from "react";
import { Container } from "@mui/material";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { MetricsCards } from "@/components/Dashboard/MetricsCards";
import FiltersPanel, {
  DashboardFilters,
} from "@/components/Dashboard/FiltersPanel";
import FilterComp from "@/components/DashboardPesquisa/FilterComp";
import GraficoDuplo from "@/components/DashboardPesquisa/GrafComparativo";
import ComparisonCards from "@/components/DashboardPesquisa/MetricComp";
import { DadoPesquisa } from "@/types/DadoPesquisa";
const PesquisaComparativa = () => {
  const [filtersLeft, setFiltersLeft] = useState<DashboardFilters>({
    tipoPesquisa: "",
    setorCurso: [],
    curso: [],
    disciplina: [],
    pergunta: [],
    lotacao: [],
  });

  const [filtersRight, setFiltersRight] = useState<DashboardFilters>({
    tipoPesquisa: "",
    setorCurso: [],
    curso: [],
    disciplina: [],
    pergunta: [],
    lotacao: [],
  });
  const [dadosLeft, setDadosLeft] = useState<DadoPesquisa[]>([]);
  const [dadosRight, setDadosRight] = useState<DadoPesquisa[]>([]);
  return (
    <DashboardLayout>
      <Container maxWidth={false} className="space-y-6">
        <FilterComp
          filtersLeft={filtersLeft}
          filtersRight={filtersRight}
          onFiltersLeftChange={setFiltersLeft}
          onFiltersRightChange={setFiltersRight}
          onDadosLeftChange={setDadosLeft} // ✅ NOVO
          onDadosRightChange={setDadosRight} // ✅ NOVO
        />

        <GraficoDuplo filtersLeft={filtersLeft} filtersRight={filtersRight} />
        <ComparisonCards
          filtersLeft={filtersLeft}
          filtersRight={filtersRight}
          dadosLeft={dadosLeft} // ✅ NOVO
          dadosRight={dadosRight} // ✅ NOVO
        />
      </Container>
    </DashboardLayout>
  );
};

export default PesquisaComparativa;
