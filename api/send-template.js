module.exports = async function(req, res){

  try {

    const { telefone, template, parametros = {} } = req.body

    /* ================= VALIDAÇÃO ================= */

    if(!telefone || !template){
      return res.status(400).json({
        error: "telefone ou template não enviado"
      })
    }

    const PHONE_ID = process.env.PHONE_NUMBER_ID || "1047101948485043"
    const TOKEN = process.env.WHATSAPP_TOKEN

    if(!TOKEN){
      return res.status(500).json({
        error: "WHATSAPP_TOKEN não configurado"
      })
    }

    const url = `https://graph.facebook.com/v19.0/${PHONE_ID}/messages`

    console.log("📤 TEMPLATE:", template)
    console.log("📞 TELEFONE:", telefone)

    /* ================= IDIOMAS ================= */

    const TEMPLATE_IDIOMAS = {
      confirmao_de_reserva: "en_US",
      reserva_especial: "en_US",
      hello_world: "en_US"
    }

    const idioma = TEMPLATE_IDIOMAS[template]

    if(!idioma){
      return res.status(400).json({
        error: "Template não permitido ou idioma não configurado"
      })
    }

    /* ================= FUNÇÃO TEMPLATE ================= */

    function montarTemplate(template, parametros){

      switch(template){

        /* ================= CONFIRMAÇÃO ================= */

        case "confirmao_de_reserva":
          return {
            name: template,
            language: { code: idioma },
            components: [
              {
                type: "body",
                parameters: [
                  { type:"text", text: parametros.nome || "Cliente" },
                  { type:"text", text: parametros.data || "20/03" },
                  { type:"text", text: parametros.hora || "20:00" },
                  { type:"text", text: parametros.pessoas || "2" }
                ]
              }
            ]
          }

        /* ================= RESERVA ESPECIAL (VIDEO) ================= */

        case "reserva_especial":

          if(!parametros.video){
            throw new Error("Template reserva_especial precisa de video")
          }

          return {
            name: template,
            language: { code: idioma },
            components: [
              {
                type: "header",
                parameters: [
                  {
                    type: "video",
                    video: {
                      link: parametros.video
                    }
                  }
                ]
              }
            ]
          }

        /* ================= HELLO WORLD ================= */

        case "hello_world":
          return {
            name: template,
            language: { code: idioma }
          }

        default:
          return null
      }
    }

    /* ================= MONTA TEMPLATE ================= */

    const templateData = montarTemplate(template, parametros)

    if(!templateData){
      return res.status(400).json({
        error: "Template não configurado"
      })
    }

    /* ================= PAYLOAD ================= */

    const payload = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "template",
      template: templateData
    }

    console.log("📦 PAYLOAD:", JSON.stringify(payload, null, 2))

    /* ================= ENVIO ================= */

    const resp = await fetch(url,{
      method:"POST",
      headers:{
        Authorization:`Bearer ${TOKEN}`,
        "Content-Type":"application/json"
      },
      body: JSON.stringify(payload)
    })

    const data = await resp.json()

console.log("📩 META RESPONSE:", data)

/* ================= ERRO META ================= */

if(data.error){
  console.log("❌ ERRO META DETALHADO:", JSON.stringify(data.error, null, 2))

  return res.status(500).json({
    error: data.error
  })
}

/* ================= SALVAR NO BANCO ================= */

/* ================= SALVAR NO BANCO ================= */

const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE
)

const numero = telefone.replace(/\D/g, "")

const { error } = await supabase
  .from("conversas_whatsapp")
  .insert({
    telefone: numero,
    mensagem: JSON.stringify({
      template,
      parametros
    }),
    tipo: "template",
    role: "assistant"
  })

if(error){
  console.error("❌ ERRO SUPABASE:", error)
}else{
  console.log("💾 TEMPLATE SALVO")
}

/* ================= RESPOSTA FINAL ================= */

return res.json({
  ok:true,
  enviado:true,
  template,
  data
})
