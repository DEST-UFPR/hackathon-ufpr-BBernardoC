import React, { useState, useEffect } from "react";
import { Box, Button, Chip, Autocomplete, TextField } from "@mui/material";
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
  tipoPesquisa: string; // Novo campo!
  setorCurso: string[];
  curso: string[];
  disciplina: string[];
  pergunta: string[];
  lotacao: string[];
}

interface Props {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
  onDadosChange: (dados: DadoPesquisa[]) => void; // Novo callback!
}

// ================= COMPONENTE =================
export default function FiltersPanel({
  filters,
  onFiltersChange,
  onDadosChange,
}: Props) {
  const [dados, setDados] = useState<DadoPesquisa[]>([]);
  const [loading, setLoading] = useState(false);

  // Carrega o JSON quando o tipo muda
  useEffect(() => {
    if (!filters.tipoPesquisa) return;

    setLoading(true);

    // Importa dinamicamente o JSON
    import(`../../../cache/${filters.tipoPesquisa}.json`)
      .then((module) => {
        const dadosCarregados = module.default as DadoPesquisa[];
        setDados(dadosCarregados);
        onDadosChange(dadosCarregados);
      })
      .catch((error) => {
        console.error(`Erro ao carregar ${filters.tipoPesquisa}.json:`, error);
        setDados([]);
        onDadosChange([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [filters.tipoPesquisa]);

  const handleChange = (
    field: keyof DashboardFilters,
    value: string | string[]
  ) => {
    const updated = { ...filters, [field]: value };

    // Limpa filtros dependentes
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
  const campoCursoOuDepto =
    filters.tipoPesquisa === "institucional" ? "DEPARTAMENTO" : "CURSO";

  const labelCursoOuDepto =
    filters.tipoPesquisa === "institucional" ? "Departamento" : "Curso";

  // ✅ OPÇÕES BASEADAS NOS DADOS CARREGADOS
  const setores = Array.from(new Set(dados.map((d) => d.SETOR_CURSO)));

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

  const lotacoes = Array.from(
    new Set(dados.map((d) => d.LOTACAO || "").filter((l) => l !== ""))
  );

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      {/* TIPO DE PESQUISA (NOVO!) */}
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
        sx={{ minWidth: 220 }}
        disabled={loading}
      />

      {/* MOSTRA FILTROS NORMAIS PARA NÃO-INSTITUCIONAL */}
      {filters.tipoPesquisa !== "institucional" && (
        <>
          {/* SETOR */}
          <Autocomplete
            multiple
            options={setores}
            value={filters.setorCurso}
            onChange={(_, value) => handleChange("setorCurso", value)}
            disabled={!filters.tipoPesquisa || loading || setores.length === 0}
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
        </>
      )}

      {/* MOSTRA FILTROS DE LOTAÇÃO PARA INSTITUCIONAL */}
      {filters.tipoPesquisa === "institucional" && (
        <Autocomplete
          multiple
          options={lotacoes}
          value={filters.lotacao}
          onChange={(_, value) => handleChange("lotacao", value)}
          disabled={!filters.tipoPesquisa || loading || lotacoes.length === 0}
          renderInput={(params) => (
            <TextField {...params} label="Lotação" size="small" />
          )}
          ChipProps={{ size: "small" }}
          sx={{ minWidth: 220 }}
        />
      )}

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
        disabled={!filters.tipoPesquisa || loading}
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
  );
}
