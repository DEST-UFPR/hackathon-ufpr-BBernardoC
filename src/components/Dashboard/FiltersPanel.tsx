import React from "react";
import { Box, Button, Chip, Autocomplete, TextField } from "@mui/material";

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
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

// ================= COMPONENTE =================
export default function FiltersPanel({ filters, onFiltersChange }: Props) {
  const dados = dadosReais as DadoPesquisa[];

  const handleChange = (field: keyof DashboardFilters, value: string[]) => {
    const updated = { ...filters, [field]: value };

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

  // ✅ SETORES ÚNICOS
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

  // ✅ PERGUNTAS BASEADAS NOS FILTROS
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
    <Box display="flex" gap={2} flexWrap="wrap">
      {/* SETOR */}
      <Autocomplete
        multiple
        options={setores}
        value={filters.setorCurso}
        onChange={(_, value) => handleChange("setorCurso", value)}
        renderInput={(params) => (
          <TextField {...params} label="Setor" size="small" />
        )}
        ChipProps={{ size: "small" }}
        sx={{ minWidth: 220 }}
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
        getOptionLabel={(option) => {
          const index = perguntas.indexOf(option);
          return `Q${index + 1} - ${option}`;
        }}
        renderInput={(params) => (
          <TextField {...params} label="Perguntas" size="small" />
        )}
        ChipProps={{ size: "small" }}
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
  );
}
