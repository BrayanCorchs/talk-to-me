# Talk to me

App para praticar **inglês, espanhol e francês** conversando (o idioma é escolhido no topo da tela inicial):

- **Modo misto em cada conversa** (menu ⋮ → *Modo da conversa*):
  - **Roteiro (sem IA):** diálogos prontos com ramificações, sugestões de resposta e tradução embutida. Custo zero.
  - **IA livre:** conversa sobre qualquer assunto com personagens de IA.
- **Minha conta de IA** (engrenagem ⚙ na tela inicial): cada pessoa coloca a própria chave do **Gemini** (tem plano gratuito), **Claude** ou **ChatGPT**. Cada um gasta os próprios limites.
- **Situações reais** em roleplay: hotel, aeroporto, restaurante e entrevista de estágio (começam no modo Roteiro).
- **Personagens** com sotaques e assuntos diferentes (Jake, Emma, Priya, Noah…), com conversa guiada ou livre.
- **Traduzir qualquer mensagem**, a sua e a da outra pessoa, tocando no ícone de tradução do balão.
- **Amigos reais**: login com Google, convite por código ou link e chat em tempo real.
- **Seus erros ficam sublinhados.** Toque no trecho para ver a correção explicada em português.
- Estatísticas de sequência de dias, frase do dia, leitura em voz alta e modo escuro.

Funciona no navegador do celular e do computador, sem depender do Claude.ai.

---

## Como funciona por dentro

| Parte | Tecnologia | Arquivo |
|---|---|---|
| Interface | HTML, CSS e JavaScript puro (sem build) | `index.html`, `style.css`, `core.js` |
| Diálogos do modo Roteiro | Árvores de diálogo em JavaScript | `scripts.js` (inglês), `scripts-intl.js` (espanhol e francês) |
| Correção sem IA | Regras de erros comuns de brasileiros + LanguageTool (código aberto) | `core.js`, `backend-firebase.js` |
| Tradução sem IA | MyMemory (gratuito, com limite diário); se falhar, usa a IA | `backend-firebase.js` |
| Login e banco de dados em tempo real | Firebase Auth + Cloud Firestore | `backend-firebase.js`, `firebase-config.js`, `firestore.rules` |
| IA com a chave de cada pessoa | Gemini, Claude ou OpenAI, chamados direto do navegador | `ai-providers.js` |
| IA do app (opcional, paga pelo dono) | API do Claude, chamada pelo servidor | `api/chat.js` |
| Hospedagem | Vercel (site estático + função serverless) | `package.json`, `vercel.json` |
| App instalável no celular (PWA) | Manifest + service worker | `manifest.webmanifest`, `sw.js`, `pwa.js`, `icons/` |

**Como a IA funciona:**
- **Chave de cada pessoa (padrão):** na engrenagem ⚙, a pessoa escolhe o provedor e cola a própria chave. A chave fica salva **só no aparelho dela** e vai direto para o provedor. Ela não passa pelo seu servidor nem pelo Firebase, e quem paga o uso é a própria pessoa.
- **IA do app (opcional):** se você configurar `ANTHROPIC_API_KEY` na Vercel, aparece também a opção "IA do app", paga por você. Nesse caso a chave fica só no servidor e o app chama `/api/chat`, que confere o login antes.
- **Sem nenhuma chave:** o modo Roteiro e o chat com amigos funcionam normalmente.

---

## Passo a passo para colocar no ar

### 1. Firebase (login + banco de dados) — gratuito

1. Acesse o **Firebase Console** e crie um projeto.
2. **Authentication** → *Começar* → aba *Método de login* → ative **Google**.
3. **Firestore Database** → *Criar banco de dados* (modo produção, região `southamerica-east1` se quiser São Paulo).
4. Ainda no Firestore, aba **Regras**: apague o conteúdo, cole o arquivo `firestore.rules` e clique em **Publicar**.
5. **Configurações do projeto** (engrenagem) → *Seus apps* → ícone **`</>`** (Web) → registre o app.
   Copie o objeto `firebaseConfig` e cole no arquivo **`firebase-config.js`**.
6. **Configurações do projeto** → aba **Contas de serviço** → *Gerar nova chave privada*.
   Vai baixar um arquivo `.json`. **Guarde com cuidado e nunca suba no GitHub.** Ele vai virar uma variável de ambiente na Vercel.

### 2. IA do app — opcional

Pule este passo se quiser que cada pessoa use a própria conta de IA (engrenagem ⚙ no app).

Se quiser oferecer a IA paga por você:
1. Acesse o **Claude Console** (console.anthropic.com), crie uma conta e adicione créditos.
2. Em **API Keys**, crie uma chave e copie (começa com `sk-ant-`).

> Custo: o modelo padrão é o mais rápido e barato (`claude-haiku-5-5`). Cada mensagem custa uma fração de centavo, mas defina um limite de gastos no console.

### 3. GitHub

1. Crie um repositório (pode ser público, é um ótimo projeto de portfólio).
2. Suba esta pasta. O `.gitignore` já impede que segredos e `node_modules` subam.

### 4. Vercel (hospedagem) — gratuito

1. Entre na **Vercel** com sua conta do GitHub → *Add New* → *Project* → importe o repositório.
2. Antes do deploy, em **Environment Variables**, adicione:

| Nome | Valor |
|---|---|
| `ANTHROPIC_API_KEY` | *(opcional, só para a "IA do app")* sua chave `sk-ant-...` |
| `FIREBASE_SERVICE_ACCOUNT` | *(opcional, só para a "IA do app")* o **conteúdo inteiro** do `.json` da conta de serviço (passo 1.6) |
| `ANTHROPIC_MODEL` | *(opcional)* outro modelo, se quiser respostas mais elaboradas |

3. Clique em **Deploy**. Você recebe um endereço como `talk-to-me.vercel.app`.

### 5. Liberar o domínio no login do Google

No Firebase: **Authentication** → **Configurações** → **Domínios autorizados** → adicione o endereço da Vercel (ex.: `talk-to-me.vercel.app`). Sem isso, o botão "Entrar com Google" dá erro.

### 6. Login no iPhone com o app instalado (recomendado)

O Safari bloqueia o login do Google quando ele acontece em outro domínio. Para evitar isso, o login passa pelo seu próprio domínio:

1. No arquivo **`vercel.json`**, troque `SEU-PROJETO` pelo ID do seu projeto Firebase (aparece em *Configurações do projeto*).
2. No **`firebase-config.js`**, troque `authDomain` pelo seu domínio da Vercel, por exemplo `authDomain: "talk-to-me.vercel.app"`.
3. No **Google Cloud Console** → *APIs e serviços* → *Credenciais* → cliente OAuth "Web client (auto created by Google Service)", adicione em **URIs de redirecionamento autorizados**: `https://talk-to-me.vercel.app/__/auth/handler`.
4. Faça um novo deploy (basta enviar a alteração para o GitHub).

Pronto! Abra o link, entre com o Google e mande seu código para os amigos.

---

## Instalar no celular

O Talk to me é um **PWA** (Progressive Web App): instala direto do navegador, ganha ícone na tela inicial e abre em tela cheia, sem barra do navegador. Não precisa de loja.

**Android (Chrome)**
1. Abra o link do app no Chrome.
2. Toque em **Instalar** no aviso que aparece no app, ou no menu **⋮** → **Instalar app**.
3. O ícone aparece na tela inicial e na gaveta de apps.

**iPhone (Safari)**
1. Abra o link no **Safari** (no Chrome do iPhone não instala).
2. Toque em **Compartilhar** (quadrado com seta para cima).
3. Role e toque em **Adicionar à Tela de Início** → **Adicionar**.

Atualizações chegam sozinhas: cada deploy na Vercel atualiza o app de todo mundo na próxima vez que abrirem.

---

## Publicar na Play Store e na App Store (opcional)

Quando quiser que o app apareça nas lojas, dá para empacotar este mesmo código:

| | Android (Play Store) | iPhone (App Store) |
|---|---|---|
| Ferramenta mais simples | **PWABuilder** (gera o pacote a partir do link do PWA) | **Capacitor** (transforma o site em app nativo) |
| Conta de desenvolvedor | US$ 25, pagamento único | US$ 99 por ano |
| Precisa de Mac? | Não | Sim, para compilar no Xcode (ou um serviço de build na nuvem) |
| Ajuste no código | Nenhum | Trocar o login do Google pelo plugin nativo do Firebase |

A Apple costuma recusar apps que são só um site embrulhado, então vale a pena chegar lá com o app já polido e com recursos de celular (notificações, por exemplo).

---

## Rodar no seu computador

```bash
npm install
npm i -g vercel
vercel link        # conecta a pasta ao projeto da Vercel
vercel env pull    # baixa as variáveis de ambiente
vercel dev         # abre em http://localhost:3000
```

Adicione `localhost` nos domínios autorizados do Firebase (normalmente já vem).

---

## Minha conta de IA (chave própria)

Cada pessoa toca na **engrenagem ⚙** da tela inicial, escolhe o provedor e cola a chave:

| Provedor | Onde criar a chave | Custo | Modelo padrão |
|---|---|---|---|
| **Google Gemini** | Google AI Studio → *Get API key* | Tem plano gratuito, com limite de uso | `gemini-3.5-flash-lite` |
| **Claude (Anthropic)** | Claude Console → *API Keys* | Pago por uso | `claude-haiku-5-5` |
| **ChatGPT (OpenAI)** | OpenAI Platform → *API keys* | Pago por uso | `gpt-5-mini` |

- O app **testa a chave** antes de salvar.
- O modelo pode ser trocado no campo "Modelo" quando sair um novo.
- **Assinaturas** (Claude Pro, ChatGPT Plus, Gemini Advanced) **não servem**: a API é uma conta separada, com chave própria.
- **Segurança:** a chave fica no `localStorage` do aparelho. Quem tiver acesso ao celular desbloqueado consegue vê-la, então vale definir um limite de gastos no provedor.

---

## Como os amigos se encontram

1. Cada pessoa ganha um **código de 6 caracteres** ao entrar pela primeira vez.
2. Na aba **Amigos reais**, toque em **Convidar**: no celular abre o menu de compartilhar (WhatsApp, Instagram…); no computador copia o link.
3. Quem abre o link `…/?convite=CODIGO` e faz login vira contato automaticamente. Também dá para digitar o código em **Adicionar**.
4. As conversas são privadas entre as duas pessoas (garantido pelas regras do Firestore).

---

## Idiomas

| Idioma | Conversa livre | Situações reais (roteiro sem IA) | Correção sem IA |
|---|---|---|---|
| Inglês | Jake, Emma, Sam, Mia, Priya, Noah, Zoe, Liam, Henry, Marcus | Hotel, aeroporto, restaurante, entrevista | Regras de erros comuns + LanguageTool |
| Espanhol | Lucía (Espanha), Mateo (Argentina), Valentina (México), Diego (Colômbia) | Restaurante, hotel, aeroporto | LanguageTool |
| Francês | Camille, Hugo, Inès (França), Olivier (Québec) | Café, hotel, aeroporto | LanguageTool |

Para adicionar outro idioma (italiano, alemão…): inclua o idioma em `LANGS` no `core.js`, crie os personagens com `lang: "it"` e, se quiser o modo Roteiro, escreva os diálogos no mesmo formato do `scripts-intl.js`.

---

## Como criar novos diálogos (modo Roteiro)

Os roteiros ficam em `scripts.js`. Cada conversa é um conjunto de **nós**:

```js
seat: {
  say: ["Can I get you something to drink?", "Posso trazer algo para beber?"], // fala em inglês + tradução
  opts: [                                         // respostas esperadas, testadas em ordem
    { k: ["coke", "water", "juice"], go: "drink", set: { drink: "$k" } }, // palavra-chave → próximo nó
    { k: ["no", "nothing"], go: "nodrink" }
  ],
  hints: [["Just water, thanks.", "Só água, obrigado."]] // sugestões que aparecem para tocar
}
```

- `k`: palavras-chave · `re`: expressão regular com captura · `min`: mínimo de palavras · `any`: aceita qualquer resposta
- `set`: guarda o que a pessoa disse (`$k` = palavra encontrada, `$1` = captura, `$last` = última palavra) e usa depois como `{drink}`
- `next`: segue direto para outro nó · `end: true`: fim da conversa
- Se nada combinar, o personagem pede para repetir e as sugestões continuam na tela.

Para ligar um roteiro a um personagem novo, adicione o personagem em `core.js` (objeto `PEOPLE`) e o roteiro em `scenes` com a mesma chave.

---

## Estrutura do banco (Firestore)

```
users/{uid}                      nome, código de convite
users/{uid}/contacts/{outroUid}  lista de contatos
codes/{CODIGO}                   aponta para o uid dono do código
threads/{uidA_uidB}              participantes + última mensagem
threads/{uidA_uidB}/messages/*   mensagens (from, text, t, errs)
```

---

## Ideias para evoluir (ótimo para o portfólio)

- **Prompts no servidor:** hoje o app envia o texto do personagem para `/api/chat`. Mover os personagens para o servidor impede que alguém use sua chave para outras coisas.
- **Limite de uso salvo no Firestore** (o limite atual é por instância do servidor).
- **PWA:** adicionar `manifest.json` e service worker para instalar na tela inicial do celular.
- **Notificações** de mensagem nova com Firebase Cloud Messaging.
- **Mensagens de voz de verdade** com a API de gravação do navegador + transcrição.
- **Histórico das conversas com IA na nuvem** (hoje fica salvo no próprio aparelho).
