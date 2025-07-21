const apiKeyInput = document.getElementById("apiKey");
const gameSelect = document.getElementById("gameSelect");
const questionInput = document.getElementById("questionInput");
const askButton = document.getElementById("askButton");
const form = document.getElementById("form");
const iaResponse = document.getElementById("iaResponse");
const markdownToHtml = (text) => {
  const coverter = new showdown.Converter();
  return coverter.makeHtml(text);
}

const perguntarIa = async (question, game, apiKey) => {
  const model = "gemini-2.5-flash";
  const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const pergunta = `
      ## Especialidade
      aqui você reforça que a IA é especialista no assunto que você está procurando resposta
      ex: Você é especialista em games

      ## Tarefa
      nessa parte você reforça que ela deve responder as perguntas do usuario, com base no conhecimento dela do assunto.
      ex: Você deve responder as perguntas dos usuarios com base no seu conhecimento do jogo, estratégias, dicas e builds

      ## Regras
      Reforça a regra
      ex: 
      - Se você não sabe a resposta, responda 'Não sei' e não invente resposta.
      - Se a pergunta não está relacionada ao jogo, responda 'Essa pergunta não está relacionada ao jogo'.
      - Considere a data atual ${new Date().toLocaleDateString()}
      - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para dar uma resposta coerente.
      - Nunca responda itens que você não tenha certeza de que existe no patch atual.

      ## Resposta
      Economize na resposta, seja direto.
      Responda no máximo 400 caracteres.
      Responda em Markdown.
      Não precisa realizar nenhuma saudação ou despedida do usuario, apenas responda o que o usuario está perguntando.
      
      ## Exemplo de resposta
      Pergunta do usuario: Melhor build ranger jungle
      Resposta: A build mais atual é: \n\n **Itens** \n\n coloque os itens aqui.\n\n**Runas\n\n exemplo de runas \n\n


      Tenho esse jogo ${game}, e queria sabe ${question}
    `;
  const contents = [
    {
      role: "user",
      parts: [
        {
          "text": pergunta
        }
      ]
    }
  ]

  const tools = [
    {
      google_search: {}
    }
  ]

  //chamada API
  const response = await fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents,
      tools
    })
  })

  const data = await response.json();
  console.log({ data });
  return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
  event.preventDefault();
  const apiKey = apiKeyInput.value;
  const game = gameSelect.value;
  const question = questionInput.value;

  if (apiKey == "" || game == "" || question == "") {
    alert("Por favor preencha todos os campos");
    return;
  }

  askButton.disabled = true;
  askButton.textContent = "Perguntando.....";
  askButton.classList.add("loading");

  try {
    //perguntar a IA
    const text = await perguntarIa(question, game, apiKey);
    iaResponse.querySelector(".response-content").innerHTML = markdownToHtml(text);
    iaResponse.classList.remove("hidden");
  } catch (error) {
    console.log("Erro: ", error);
  } finally {
    askButton.disabled = false;
    askButton.textContent = "Perguntar";
    askButton.classList.remove("loading");
  }

};

form.addEventListener("submit", enviarFormulario)