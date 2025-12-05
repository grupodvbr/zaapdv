import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const supa = createClient(
  "https://ckkqcxbzfkjzicvoeehw.supabase.co",
  "sb_publishable_djiQsCSrnLUm0iA_eNjjMw__7rfP11m"
);

// =======================
// LISTAR ITENS DO SETOR
// =======================
export async function listarItens(setor) {
  const { data, error } = await supa
    .from("itens_setores")
    .select("*")
    .eq("setor", setor)
    .order("categoria", { ascending: true })
    .order("item", { ascending: true });

  if (error) {
    console.error("ERRO LISTAR ITENS:", error);
    return [];
  }

  return data;
}

// =======================
// REGISTRAR CONTAGEM
// =======================
export async function registrarContagem(obj) {
  const { error } = await supa
    .from("registros")
    .insert({
      usuario: obj.usuario,
      setor: obj.setor,
      categoria: obj.categoria,
      item: obj.item,
      quantidade: obj.quantidade
    });

  return { ok: !error, error };
}

// =======================
// PEGAR DIAS COM CONTAGEM
// =======================
export async function diasComContagem(setor) {
  const { data, error } = await supa
    .from("registros")
    .select("data_hora")
    .eq("setor", setor);

  if (error) return [];

  // extrair apenas data (AAAA-MM-DD)
  const dias = [...new Set(
    data.map(d => d.data_hora.split("T")[0])
  )];

  return dias;
}
