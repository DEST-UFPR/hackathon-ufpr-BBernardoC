import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Chip,
  Typography,
  Paper,
  Autocomplete,
  TextField,
} from "@mui/material";

import { DadoPesquisa } from "@/types/DadoPesquisa";

// ================= MAPEAMENTO DOS TIPOS =================
const TIPOS_PESQUISA = [
  { label: "Disciplina Presencial", value: "disciplina_presencial" },
  { label: "Disciplina EAD", value: "disciplina_ead" },
  { label: "Curso", value: "cursos" },
  { label: "Institucional", value: "institucional" },
];

// ================= INTERFACE =================
export interface DashboardFilters {
  tipoPesquisa: string;
  setorCurso: string[];
  curso: string[];
  disciplina: string[];
  pergunta: string[];
  lotacao: string[];
}

interface Props {
  filtersLeft: DashboardFilters;
  filtersRight: DashboardFilters;
  onFiltersLeftChange: (filters: DashboardFilters) => void;
  onFiltersRightChange: (filters: DashboardFilters) => void;
  onDadosLeftChange: (dados: DadoPesquisa[]) => void; // ✅ NOVO!
  onDadosRightChange: (dados: DadoPesquisa[]) => void; // ✅ NOVO!
}

// ================= COMPONENTE INDIVIDUAL =================
interface FilterSideProps {
  title: string;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onDadosChange: (dados: DadoPesquisa[]) => void; // ✅ NOVO!
}

function FilterSide({
  title,
  filters,
  onFiltersChange,
  onDadosChange, // ✅ NOVO!
}: FilterSideProps) {
  const [dados, setDados] = useState<DadoPesquisa[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega o JSON quando o tipo muda
  useEffect(() => {
    if (!filters.tipoPesquisa) {
      setDados([]);
      onDadosChange([]); // ✅ NOTIFICA O PAI!
      return;
    }

    setLoading(true);

    import(`../../../cache/${filters.tipoPesquisa}.json`)
      .then((module) => {
        const dadosCarregados = module.default as DadoPesquisa[];
        setDados(dadosCarregados);
        onDadosChange(dadosCarregados); // ✅ NOTIFICA O PAI!
      })
      .catch((error) => {
        console.error(`Erro ao carregar ${filters.tipoPesquisa}.json:`, error);
        setDados([]);
        onDadosChange([]); // ✅ NOTIFICA O PAI!
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters.tipoPesquisa, onDadosChange]);

  const handleChange = (
    field: keyof DashboardFilters,
    value: string | string[]
  ) => {
    const updated = { ...filters, [field]: value };

    // 🔁 RESET EM CASCATA
    if (field === "tipoPesquisa") {
      updated.setorCurso = [];
      updated.curso = [];
      updated.disciplina = [];
      updated.pergunta = [];
      updated.lotacao = [];
    }

    if (field === "setorCurso") {
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

  // ✅ SETORES
  const setores = Array.from(new Set(dados.map((d) => d.SETOR_CURSO)));

  // ✅ CURSOS BASEADOS NO SETOR
  const cursos =
    filters.setorCurso.length === 0
      ? []
      : Array.from(
          new Set(
            dados
              .filter((d) => filters.setorCurso.includes(d.SETOR_CURSO))
              .map((d) => d.CURSO)
          )
        );

  // ✅ DISCIPLINAS BASEADAS EM SETOR + CURSO
  const disciplinas =
    filters.curso.length === 0 || filters.curso.length > 1
      ? []
      : Array.from(
          new Set(
            dados
              .filter(
                (d) =>
                  filters.setorCurso.includes(d.SETOR_CURSO) &&
                  filters.curso.includes(d.CURSO)
              )
              .map((d) => d.NOME_DISCIPLINA)
          )
        );

  // ✅ PERGUNTAS DINÂMICAS
  const perguntas = Array.from(
    new Set(
      dados
        .filter((d) => {
          const setorMatch =
            filters.setorCurso.length === 0 ||
            filters.setorCurso.includes(d.SETOR_CURSO);

          const cursoMatch =
            filters.curso.length === 0 || filters.curso.includes(d.CURSO);

          const disciplinaMatch =
            filters.disciplina.length === 0 ||
            filters.disciplina.includes(d.NOME_DISCIPLINA);

          const lotacaoMatch =
            filters.lotacao.length === 0 ||
            filters.lotacao.includes(d.LOTACAO || "");

          return setorMatch && cursoMatch && disciplinaMatch && lotacaoMatch;
        })
        .map((d) => d.PERGUNTA)
    )
  );

  // ✅ LOTAÇÕES (para tipo institucional)
  const lotacoes = Array.from(
    new Set(dados.map((d) => d.LOTACAO || "").filter((l) => l !== ""))
  );

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
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
        />

        {/* FILTROS PARA NÃO-INSTITUCIONAL */}
        {filters.tipoPesquisa !== "institucional" && (
          <>
            {/* SETOR */}
            <Autocomplete
              multiple
              options={setores}
              value={filters.setorCurso}
              onChange={(_, newValue) => handleChange("setorCurso", newValue)}
              disabled={
                !filters.tipoPesquisa || loading || setores.length === 0
              }
              renderInput={(params) => (
                <TextField {...params} label="Setor" size="small" />
              )}
              ChipProps={{ size: "small" }}
            />

            {/* CURSO */}
            <Autocomplete
              multiple
              options={cursos}
              value={filters.curso}
              onChange={(_, newValue) => handleChange("curso", newValue)}
              disabled={cursos.length === 0}
              renderInput={(params) => (
                <TextField {...params} label="Curso" size="small" />
              )}
              ChipProps={{ size: "small" }}
            />

            {/* DISCIPLINA — BLOQUEADA QUANDO tipoPesquisa = cursos */}
            {filters.tipoPesquisa !== "cursos" && (
              <Autocomplete
                multiple
                options={disciplinas}
                value={filters.disciplina}
                onChange={(_, newValue) => handleChange("disciplina", newValue)}
                disabled={disciplinas.length === 0}
                renderInput={(params) => (
                  <TextField {...params} label="Disciplina" size="small" />
                )}
                ChipProps={{ size: "small" }}
              />
            )}
          </>
        )}

        {/* FILTRO DE LOTAÇÃO PARA INSTITUCIONAL */}
        {filters.tipoPesquisa === "institucional" && (
          <Autocomplete
            multiple
            options={lotacoes}
            value={filters.lotacao}
            onChange={(_, newValue) => handleChange("lotacao", newValue)}
            disabled={!filters.tipoPesquisa || loading || lotacoes.length === 0}
            renderInput={(params) => (
              <TextField {...params} label="Lotação" size="small" />
            )}
            ChipProps={{ size: "small" }}
          />
        )}

        {/* PERGUNTAS */}
        <Autocomplete
          multiple
          options={perguntas}
          value={filters.pergunta}
          onChange={(_, newValue) => handleChange("pergunta", newValue)}
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
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            const index = perguntas.indexOf(option);

            return (
              <li key={key} {...rest}>
                {`Q${index + 1} - ${option}`}
              </li>
            );
          }}
          ListboxProps={{
            style: { maxHeight: "320px" },
          }}
        />

        {/* BOTÃO LIMPAR */}
        <Button
          variant="outlined"
          onClick={() =>
            onFiltersChange({
              tipoPesquisa: "",
              setorCurso: [],
              curso: [],
              disciplina: [],
              pergunta: [],
              lotacao: [],
            })
          }
        >
          Limpar filtros
        </Button>
      </Box>
    </Paper>
  );
}

// ================= COMPONENTE PRINCIPAL =================
export default function FilterComp({
  filtersLeft,
  filtersRight,
  onFiltersLeftChange,
  onFiltersRightChange,
  onDadosLeftChange, // ✅ NOVO!
  onDadosRightChange, // ✅ NOVO!
}: Props) {
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "1fr", md: "1fr 1fr" }}
        gap={3}
      >
        <FilterSide
          title="Filtros - Lado Esquerdo"
          filters={filtersLeft}
          onFiltersChange={onFiltersLeftChange}
          onDadosChange={onDadosLeftChange} // ✅ NOVO!
        />

        <FilterSide
          title="Filtros - Lado Direito"
          filters={filtersRight}
          onFiltersChange={onFiltersRightChange}
          onDadosChange={onDadosRightChange} // ✅ NOVO!
        />
      </Box>
    </Box>
  );
}
