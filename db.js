import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supa = createClient(
  "https://ckkqcxbzfkjzicvoeehw.supabase.co",
  "sb_publishable_djiQsCSrnLUm0iA_eNjjMw__7rfP11m"
);

// =======================
// LISTAR DIAS COM CONTAGEM
// =======================
export async function diasComContagem(setor) {
  const { data, error } = await supa
    .from("registros")
    .select("data_hora")
    .eq("setor", setor);

  if (error) {
    console.error("Erro dias:", error);
    return [];
  }

  return [...new Set(data.map(x => x.data_hora.split("T")[0]))];
}

// =======================
// PEGAR REGISTROS DO DIA
// =======================
export async function registrosDoDia(data, setor) {
  const inicio = data + " 00:00:00";
  const fim = data + " 23:59:59";

  const { data: registros, error } = await supa
    .from("registros")
    .select("*")
    .eq("setor", setor)
    .gte("data_hora", inicio)
    .lte("data_hora", fim)
    .order("categoria")
    .order("item");

  if (error) return [];
  return registros;
}
