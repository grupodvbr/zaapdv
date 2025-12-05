import { supa } from "./supabase.js";

/* LISTAR ITENS DE UM SETOR */
export async function listarItens(setor){
  const { data } = await supa
    .from("itens_setores")
    .select("*")
    .eq("setor", setor);
  return data || [];
}

/* REGISTRAR UM LANÇAMENTO */
export async function registrarContagem(info){
  const { error } = await supa.from("registros").insert(info);
  return !error;
}

/* CONTAR PENDENTES DE UM SETOR */
export async function contarPendentes(setor){
  const { count } = await supa
    .from("registros")
    .select("id", { count:"exact" })
    .eq("setor", setor);

  return count ?? 0;
}

/* DIAS VÁLIDOS */
export async function diasValidos(){
  const { data } = await supa.from("dias_parametros").select("*");
  return data || [];
}

/* REGISTRAR HISTÓRICO */
export async function registrarHistorico(usuario, cargo, descricao){
  const { error } = await supa.from("registros").insert({
    usuario,
    setor:"HISTORICO",
    categoria:cargo,
    item:descricao,
    quantidade:0
  });
  return !error;
}
