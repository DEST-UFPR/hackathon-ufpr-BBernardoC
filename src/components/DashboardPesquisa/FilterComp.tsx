import React from "react";
import {
  Box,
  Button,
  Chip,
  Typography,
  Paper,
  Autocomplete,
  TextField,
} from "@mui/material";

import dadosReais from "@/utils/dados_disciplinaPresencial.json";
import { DadoPesquisa } from "@/types/DadoPesquisa";

// ================= INTERFACE =================
export interface DashboardFilters {
  setorCurso: string[];
  curso: string[];
  disciplina: string[];
  pergunta: string[];
  questionario: string;
}

interface Props {
  filtersLeft: DashboardFilters;
  filtersRight: DashboardFilters;
  onFiltersLeftChange: (filters: DashboardFilters) => void;
  onFiltersRightChange: (filters: DashboardFilters) => void;
}

// ================= COMPONENTE INDIVIDUAL =================
interface FilterSideProps {
  title: string;
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  dados: DadoPesquisa[];
}

function FilterSide({
  title,
  filters,
  onFiltersChange,
  dados,
}: FilterSideProps) {
  const handleChange = (field: keyof DashboardFilters, value: string[]) => {
    const updated = { ...filters, [field]: value };

    // 🔁 RESET EM CASCATA (lógica consistente)
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
  const setores = Array.from(new Set(dados.map((d) => d.setorCurso)));

  // ✅ CURSOS BASEADOS NO SETOR
  const cursos =
    filters.setorCurso.length === 0
      ? []
      : Array.from(
          new Set(
            dados
              .filter((d) => filters.setorCurso.includes(d.setorCurso))
              .map((d) => d.curso)
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
                  filters.setorCurso.includes(d.setorCurso) &&
                  filters.curso.includes(d.curso)
              )
              .map((d) => d.disciplina)
          )
        );

  // ✅ PERGUNTAS DINÂMICAS
  const perguntas = Array.from(
    new Set(
      dados
        .filter((d) => {
          const setorMatch =
            filters.setorCurso.length === 0 ||
            filters.setorCurso.includes(d.setorCurso);

          const cursoMatch =
            filters.curso.length === 0 || filters.curso.includes(d.curso);

          const disciplinaMatch =
            filters.disciplina.length === 0 ||
            filters.disciplina.includes(d.disciplina);

          return setorMatch && cursoMatch && disciplinaMatch;
        })
        .map((d) => d.pergunta)
    )
  );

  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
      <Typography variant="h6" gutterBottom color="primary">
        {title}
      </Typography>

      <Box display="flex" flexDirection="column" gap={2}>
        {/* SETOR */}
        <Autocomplete
          multiple
          options={setores}
          value={filters.setorCurso}
          onChange={(_, newValue) => handleChange("setorCurso", newValue)}
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

        {/* DISCIPLINA */}
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

        {/* PERGUNTAS */}
        <Autocomplete
          multiple
          options={perguntas}
          value={filters.pergunta}
          onChange={(_, newValue) => handleChange("pergunta", newValue)}
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
              setorCurso: [],
              curso: [],
              disciplina: [],
              pergunta: [],
              questionario: "Todos",
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
}: Props) {
  const dados = dadosReais as DadoPesquisa[];

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
          dados={dados}
        />

        <FilterSide
          title="Filtros - Lado Direito"
          filters={filtersRight}
          onFiltersChange={onFiltersRightChange}
          dados={dados}
        />
      </Box>
    </Box>
  );
}
