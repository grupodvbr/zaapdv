import { supa } from "./supabase.js";

export async function listarItens(setor) {
  const { data } = await supa
    .from("itens_setores")
    .select("*")
    .eq("setor", setor);
  return data || [];
}

export async function registrarContagem(info) {
  const { error } = await supa.from("registros").insert(info);
  return !error;
}

export async function contarPendentes(setor) {
  const { data, count } = await supa
    .from("registros")
    .select("id", { count: "exact" })
    .eq("setor", setor);

  return count ?? 0;
}

export async function listarDiasValidos() {
  const { data } = await supa.from("dias_parametros").select("*");
  return data || [];
}
