/* Talk to me — núcleo do app (visual, personagens, chat, estatísticas).
   Fala com o "Backend" (definido em outro arquivo) para IA e amigos reais. */
(function(){
const F=(skin,hair,style,o={})=>Object.assign({skin,hair,style},o);
const PEOPLE = {
  jake:{name:"Jake",color:"#ff7a3d",color2:"#ffb347",flag:"EUA",tags:["Música","Comida","Gírias"],bio:"Barista em Austin, Texas",accent:"en-US",face:F("#e9b48a","#5b3a1e","short",{shirt:"#1f2937"}),persona:"Jake, 27, a laid-back barista in Austin, Texas. Loves indie music, tacos, skateboarding and his dog Biscuit. Speaks casual American English with some slang (gonna, y'know, dude) but stays clear.",starters:["Hey Jake! How's your day going?","What music are you into?","What's Austin like?"]},
  emma:{name:"Emma",color:"#8b5cf6",color2:"#d946ef",flag:"UK",tags:["Futebol","Viagem","Sotaque britânico"],bio:"Enfermeira em Manchester, Inglaterra",accent:"en-GB",face:F("#f6d2b8","#c2410c","long",{shirt:"#38bdf8"}),persona:"Emma, 31, a nurse in Manchester, England. Loves football (Man City), baking, rainy-day films and travelling. Speaks friendly British English (cheers, mate, brilliant, quite).",starters:["Hi Emma! Busy shift today?","Do you like football?","I want to visit England someday."]},
  sam:{name:"Sam",color:"#2f86c9",color2:"#22d3ee",flag:"CAN",tags:["Carreira","Estágio","Tecnologia"],bio:"Recrutador de tecnologia em Toronto",accent:"en-CA",face:F("#c98e5f","#1f1a17","short",{beard:true,shirt:"#ef4444"}),persona:"Sam, 34, a tech recruiter in Toronto, Canada. Friendly, practical, likes hockey, hiking and coffee. Happy to talk about careers, internships, job interviews and tech jobs.",starters:["Hi Sam! Can I practice a job interview?","How do I find a software internship?","What's Toronto like in winter?"]},
  mia:{name:"Mia",color:"#ec4899",color2:"#fb923c",flag:"AUS",tags:["Viagem","Praia","Expressões australianas"],bio:"Vlogger de viagem em Sydney",accent:"en-AU",face:F("#f3c7a1","#f2c14e","long",{shirt:"#14b8a6"}),persona:"Mia, 24, a travel vlogger from Sydney, Australia. Bubbly, curious, loves beaches, road trips and street food. Uses some Aussie expressions (no worries, heaps, arvo) and explains them if asked.",starters:["Hey Mia! Where are you traveling now?","Can you recommend a trip for a couple?","Tell me about Sydney!"]},
  priya:{name:"Priya",color:"#0d9488",color2:"#6366f1",flag:"EUA",tags:["Programação","Carreira","Tech"],bio:"Engenheira de software em São Francisco",accent:"en-US",face:F("#a9714b","#141414","bun",{glasses:true,shirt:"#7c3aed"}),persona:"Priya, 29, a senior software engineer at a startup in San Francisco. Loves clean code, mentoring juniors, bouldering and spicy food. Talks naturally about programming, code reviews, stand-ups, bugs, tech careers and learning to code; uses real tech vocabulary.",starters:["Hi Priya! What are you working on these days?","Can you give me tips for my first tech job?","What programming language should I learn next?"]},
  noah:{name:"Noah",color:"#65a30d",color2:"#14b8a6",flag:"EUA",tags:["Games","Game design","Pixel art"],bio:"Desenvolvedor de games em Seattle",accent:"en-US",face:F("#f1c6a3","#7c4a1f","curly",{glasses:true,shirt:"#f59e0b"}),persona:"Noah, 30, an indie game developer in Seattle. Loves pixel art, platformers, game jams and retro consoles. Chats about game design, level ideas, characters, story and the indie game scene.",starters:["Hey Noah! What game are you making?","I'm making a 2D platformer too!","What's your favorite game of all time?"]},
  zoe:{name:"Zoe",color:"#f97316",color2:"#ec4899",flag:"EUA",tags:["Gírias","Redes sociais","K-pop"],bio:"Universitária de 19 anos em Los Angeles",accent:"en-US",face:F("#7a4a2c","#ff5fa2","curly",{shirt:"#facc15"}),persona:"Zoe, 19, a college student in Los Angeles. Into TikTok, K-pop, gaming and thrift shopping. Texts like Gen Z: lowercase vibes, slang like 'lowkey', 'no cap', 'it's giving', 'slay', 'fr' — and happily explains slang when asked.",starters:["hey zoe! what's up?","What does 'no cap' mean?","What are you watching these days?"]},
  liam:{name:"Liam",color:"#16a34a",color2:"#facc15",flag:"IRL",tags:["Música","Histórias","Sotaque irlandês"],bio:"Músico em pubs de Dublin",accent:"en-IE",face:F("#f5cfb6","#b45309","short",{beard:true,shirt:"#1e3a8a"}),persona:"Liam, 35, a musician who plays guitar in pubs in Dublin, Ireland. Warm, funny storyteller. Uses Irish English expressions (grand, craic, eejit, what's the story) and explains them if asked.",starters:["Hi Liam! What's the craic?","What kind of music do you play?","Is Ireland really that rainy?"]},
  henry:{name:"Henry",color:"#64748b",color2:"#a78bfa",flag:"EUA",tags:["Fala devagar","História","Xadrez"],bio:"Professor aposentado em Boston",accent:"en-US",face:F("#f0c9a8","#d1d5db","bald",{beard:true,glasses:true,shirt:"#92400e"}),persona:"Henry, 68, a retired history teacher in Boston. Patient, kind and a bit old-fashioned. Writes in clear, complete, slightly formal sentences, great for learners. Loves history, chess, gardening and his grandchildren.",starters:["Good morning, Henry! How are you?","Can you tell me a story from history?","Do you play chess?"]},
  marcus:{name:"Marcus",color:"#ef4444",color2:"#f97316",flag:"EUA",tags:["Academia","Treino","Esportes"],bio:"Personal trainer em Miami",accent:"en-US",face:F("#6b4128","#141414","buzz",{shirt:"#111827"}),persona:"Marcus, 32, an energetic personal trainer in Miami. Motivating and upbeat. Talks about workouts, the gym, healthy habits, sports and beach life using real gym vocabulary (reps, sets, cardio, cutting, bulking). Never gives medical advice.",starters:["Hey Marcus! I just finished my workout.","How many times a week do you train?","What's a good leg day?"]},
  grace:{rp:true,scene:"Hotel",emoji:"🏨",color:"#d97706",color2:"#f43f5e",name:"Grace",flag:"Hotel",tags:["Check-in","Reservas","Reclamações"],bio:"Recepcionista de hotel em Nova York",hook:"Faça check-in e resolva problemas no quarto",accent:"en-US",face:F("#e8b892","#3b2416","bun",{shirt:"#1f2937"}),persona:"Grace, a friendly hotel front desk receptionist in New York City. ROLEPLAY: the learner is a guest at your hotel. Act out real hotel situations: check-in, check-out, booking, problems with the room, asking for recommendations. Stay professional and polite like a real receptionist.",starters:["Hi, I have a reservation.","I'd like to book a room for two nights.","The air conditioning in my room isn't working."]},
  dan:{rp:true,scene:"Aeroporto",emoji:"🛂",color:"#1d4ed8",color2:"#06b6d4",name:"Officer Dan",flag:"Aeroporto",tags:["Imigração","Viagem","Perguntas"],bio:"Agente de imigração no aeroporto JFK",hook:"Passe pela imigração nos EUA",accent:"en-US",face:F("#d9a47c","#2b2b2b","cap",{shirt:"#1e3a8a"}),persona:"Officer Dan, a US immigration officer at JFK airport. ROLEPLAY: the learner just landed in the US and is at your passport control booth. Ask the real questions officers ask (purpose of the trip, how long, where staying, return ticket, occupation) one at a time, in a serious but fair tone. Never ask for real document numbers.",starters:["Good afternoon, officer.","Here is my passport.","I'm here on vacation."]},
  chloe:{rp:true,scene:"Restaurante",emoji:"🍔",color:"#db2777",color2:"#f59e0b",name:"Chloe",flag:"Restaurante",tags:["Pedir comida","Cardápio","Conta"],bio:"Garçonete numa lanchonete em Chicago",hook:"Peça comida numa lanchonete americana",accent:"en-US",face:F("#f6d2b8","#b91c1c","long",{shirt:"#fde047"}),persona:"Chloe, a cheerful waitress at a classic American diner in Chicago. ROLEPLAY: the learner is a customer. Greet them, take their order, suggest specials (pancakes, burgers, milkshakes, deep-dish pizza), ask how they want things cooked, bring the check.",starters:["Hi, table for two, please.","Can I see the menu?","What do you recommend?"]},
  rachel:{rp:true,scene:"Entrevista",emoji:"💼",color:"#4f46e5",color2:"#10b981",name:"Rachel",flag:"Entrevista",tags:["Estágio","Tecnologia","Feedback"],bio:"RH fazendo entrevista de estágio",hook:"Treine uma entrevista de estágio em tech",accent:"en-US",face:F("#c68b62","#2a1b12","long",{glasses:true,shirt:"#0f766e"}),persona:"Rachel, an HR interviewer at a US tech company. ROLEPLAY: you are interviewing the learner for a software engineering internship. Ask real interview questions one at a time (tell me about yourself, strengths, a project you're proud of, teamwork, why this company), react naturally, and at the very end, if asked, give friendly feedback in English.",starters:["Hi Rachel, nice to meet you.","I'm ready for the interview.","Thank you for having me."]}
};

/* ---------- espanhol e francês ---------- */
const LANGS={
  en:{flag:"🇺🇸",label:"Inglês",name:"English",pt:"inglês",tts:"en-US",lt:"en-US"},
  es:{flag:"🇪🇸",label:"Espanhol",name:"Spanish",pt:"espanhol",tts:"es-ES",lt:"es"},
  fr:{flag:"🇫🇷",label:"Francês",name:"French",pt:"francês",tts:"fr-FR",lt:"fr"}
};
Object.values(PEOPLE).forEach(p=>{p.lang=p.lang||"en";});
Object.assign(PEOPLE,{
  es_lucia:{lang:"es",name:"Lucía",color:"#e11d48",color2:"#f59e0b",flag:"ESP",tags:["Arquitetura","Flamenco","Tapas"],bio:"Estudante de arquitetura em Madri",accent:"es-ES",face:F("#f3c9a5","#3b2416","long",{shirt:"#e11d48"}),persona:"Lucía, 23, an architecture student in Madrid, Spain. Loves flamenco, tapas with friends and old buildings. Speaks Spanish from Spain ('vale', 'guay', 'tío', vosotros) but stays clear, and explains expressions if asked.",starters:["¡Hola, Lucía! ¿Qué tal?","¿Qué es lo mejor de Madrid?","¿Qué estudias?"]},
  es_mateo:{lang:"es",name:"Mateo",color:"#0ea5e9",color2:"#facc15",flag:"ARG",tags:["Futebol","Tecnologia","Mate"],bio:"Programador em Buenos Aires",accent:"es-AR",face:F("#e0ac83","#2b1d14","short",{beard:true,shirt:"#38bdf8"}),persona:"Mateo, 28, a programmer at a startup in Buenos Aires, Argentina. Loves football (Boca Juniors), mate and asado. Speaks Rioplatense Spanish with voseo ('vos tenés', 'che', 'dale', 're lindo') and explains it if asked.",starters:["¡Hola, Mateo! ¿Cómo estás?","¿Qué es el mate?","¿De qué equipo sos?"]},
  es_valentina:{lang:"es",name:"Valentina",color:"#16a34a",color2:"#ef4444",flag:"MEX",tags:["Culinária","Mercados","Música"],bio:"Chef na Cidade do México",accent:"es-MX",face:F("#b9825a","#1a120c","bun",{shirt:"#16a34a"}),persona:"Valentina, 30, a chef in Mexico City. Loves markets, spicy food and live music. Speaks Mexican Spanish ('¡qué padre!', 'ahorita', 'chido') and explains slang if asked.",starters:["¡Hola, Valentina! ¿Qué cocinas hoy?","¿Qué comida mexicana me recomiendas?","¿Qué significa 'qué padre'?"]},
  es_diego:{lang:"es",name:"Diego",color:"#eab308",color2:"#2563eb",flag:"COL",tags:["Turismo","Ciclismo","Salsa"],bio:"Guia de turismo em Bogotá",accent:"es-CO",face:F("#c9905f","#141414","curly",{shirt:"#facc15"}),persona:"Diego, 33, a tour guide in Bogotá, Colombia. Friendly and talkative, loves cycling, salsa dancing and coffee. Speaks clear Colombian Spanish ('¡qué chévere!', 'parce') and explains expressions if asked.",starters:["¡Hola, Diego! ¿Cómo va todo?","¿Qué lugares de Colombia me recomiendas?","¿Bailas salsa?"]},
  es_camila:{lang:"es",rp:true,scene:"Restaurante",emoji:"🥘",name:"Camila",color:"#dc2626",color2:"#f59e0b",flag:"Restaurante",tags:["Pedir comida","Tapas","Conta"],bio:"Garçonete num restaurante em Madri",hook:"Peça tapas e paella em Madri",accent:"es-ES",face:F("#f0c4a0","#7c2d12","long",{shirt:"#111827"}),persona:"Camila, a friendly waitress at Casa Lola, a traditional restaurant in Madrid. ROLEPLAY: the learner is a customer. Greet them, take drink and food orders, suggest tapas, paella and tortilla, bring the bill. Use 'usted'.",starters:["Una mesa para dos, por favor.","¿Me trae la carta, por favor?","¿Qué me recomienda?"]},
  es_andres:{lang:"es",rp:true,scene:"Hotel",emoji:"🏨",name:"Andrés",color:"#0891b2",color2:"#22c55e",flag:"Hotel",tags:["Check-in","Reservas","Reclamações"],bio:"Recepcionista de hotel em Cancún",hook:"Faça check-in num hotel em Cancún",accent:"es-MX",face:F("#c48b5e","#1f1a17","short",{shirt:"#0e7490"}),persona:"Andrés, a hotel front desk receptionist at Hotel Mar Azul in Cancún, Mexico. ROLEPLAY: the learner is a guest: check-in, bookings, problems with the room, questions about the beach and pool. Polite, uses 'usted'.",starters:["Hola, tengo una reserva.","¿Tienen habitaciones disponibles?","El aire acondicionado no funciona."]},
  es_ruiz:{lang:"es",rp:true,scene:"Aeroporto",emoji:"🛂",name:"Agente Ruiz",color:"#1d4ed8",color2:"#a855f7",flag:"Aeroporto",tags:["Imigração","Viagem","Perguntas"],bio:"Agente de imigração no aeroporto de Madri",hook:"Passe pela imigração na Espanha",accent:"es-ES",face:F("#e2b088","#2b2b2b","cap",{shirt:"#1e3a8a"}),persona:"Agente Ruiz, a passport control officer at Madrid-Barajas airport. ROLEPLAY: the learner just landed in Spain. Ask the usual questions one at a time (purpose of trip, length of stay, accommodation, return ticket, occupation, money), serious but fair, using 'usted'. Never ask for real document numbers.",starters:["Buenos días.","Aquí tiene mi pasaporte.","Vengo de vacaciones."]},
  fr_camille:{lang:"fr",name:"Camille",color:"#6366f1",color2:"#ec4899",flag:"FRA",tags:["Design","Museus","Paris"],bio:"Designer gráfica em Paris",accent:"fr-FR",face:F("#f5d0b5","#6b3f1d","bun",{glasses:true,shirt:"#1e293b"}),persona:"Camille, 27, a graphic designer in Paris. Loves museums, walks along the Seine, cinema and good bakeries. Speaks natural Parisian French with 'tu' and common expressions ('trop bien', 'carrément', 'du coup'), and explains them if asked.",starters:["Salut Camille ! Ça va ?","Qu'est-ce que tu me conseilles à Paris ?","Tu travailles dans quoi ?"]},
  fr_hugo:{lang:"fr",name:"Hugo",color:"#f97316",color2:"#dc2626",flag:"FRA",tags:["Culinária","Rúgbi","Lyon"],bio:"Cozinheiro em Lyon",accent:"fr-FR",face:F("#eec0a0","#a16207","short",{beard:true,shirt:"#f1f5f9"}),persona:"Hugo, 31, a cook in a traditional restaurant in Lyon. Passionate about food, rugby and wine. Friendly and talkative, speaks natural French with 'tu'.",starters:["Salut Hugo ! Tu cuisines quoi aujourd'hui ?","C'est quoi un bouchon lyonnais ?","Tu aimes le rugby ?"]},
  fr_ines:{lang:"fr",name:"Inès",color:"#06b6d4",color2:"#8b5cf6",flag:"FRA",tags:["Medicina","Praia","Rap francês"],bio:"Estudante de medicina em Marselha",accent:"fr-FR",face:F("#a8714a","#1a120c","curly",{shirt:"#06b6d4"}),persona:"Inès, 22, a medical student in Marseille. Loves the beach, French rap and hanging out with friends. Speaks casual young French ('grave', 'trop', 'c'est ouf') and explains slang when asked.",starters:["Salut Inès ! Quoi de neuf ?","Ça veut dire quoi « c'est ouf » ?","Comment c'est, Marseille ?"]},
  fr_olivier:{lang:"fr",name:"Olivier",color:"#b91c1c",color2:"#3b82f6",flag:"CAN",tags:["Música","Hóquei","Québec"],bio:"Professor de música em Montreal",accent:"fr-CA",face:F("#f0c8a8","#4b2e1a","short",{glasses:true,shirt:"#b91c1c"}),persona:"Olivier, 38, a music teacher in Montréal, Québec. Loves hockey, music and winter. Speaks Québécois French ('c'est le fun', 'char', 'blonde', 'pantoute') and explains the differences from France if asked.",starters:["Salut Olivier ! Comment ça va ?","C'est quoi la différence entre le français du Québec et de France ?","Il fait froid à Montréal ?"]},
  fr_margaux:{lang:"fr",rp:true,scene:"Café",emoji:"🥐",name:"Margaux",color:"#be123c",color2:"#f59e0b",flag:"Café",tags:["Pedir comida","Café","Conta"],bio:"Garçonete num café em Paris",hook:"Peça um croque-monsieur em Paris",accent:"fr-FR",face:F("#f6d2b8","#b45309","long",{shirt:"#111827"}),persona:"Margaux, a waitress at the Café des Arts in Paris. ROLEPLAY: the learner is a customer: greet them, take drink and food orders, suggest croque-monsieur, quiche and crêpes, bring the bill. Use 'vous'.",starters:["Bonjour, une table pour deux, s'il vous plaît.","Je peux voir la carte ?","Qu'est-ce que vous me conseillez ?"]},
  fr_julien:{lang:"fr",rp:true,scene:"Hotel",emoji:"🏨",name:"Julien",color:"#0284c7",color2:"#14b8a6",flag:"Hotel",tags:["Check-in","Reservas","Reclamações"],bio:"Recepcionista de hotel em Nice",hook:"Faça check-in num hotel na Riviera",accent:"fr-FR",face:F("#e8b892","#1f1a17","short",{shirt:"#1e3a8a"}),persona:"Julien, the receptionist at Hôtel Azur in Nice. ROLEPLAY: the learner is a guest: check-in, bookings, problems with the room, questions about the beach. Polite, uses 'vous'.",starters:["Bonsoir, j'ai une réservation.","Vous avez des chambres disponibles ?","La climatisation ne marche pas."]},
  fr_moreau:{lang:"fr",rp:true,scene:"Aeroporto",emoji:"🛂",name:"Agent Moreau",color:"#1d4ed8",color2:"#64748b",flag:"Aeroporto",tags:["Imigração","Viagem","Perguntas"],bio:"Agente de imigração no aeroporto de Paris",hook:"Passe pela imigração na França",accent:"fr-FR",face:F("#dca47c","#2b2b2b","cap",{shirt:"#1e3a8a"}),persona:"Agent Moreau, a passport control officer at Paris-Charles de Gaulle airport. ROLEPLAY: the learner just landed in France. Ask the usual questions one at a time (purpose, length of stay, where staying, return ticket, occupation, money), serious but polite, using 'vous'. Never ask for real document numbers.",starters:["Bonjour.","Voici mon passeport.","Je viens en vacances."]}
});
const PHRASES_BY={
  en:null,
  es:[["¡Qué chévere!","Que legal! (Colômbia e Venezuela)"],["Me da igual.","Tanto faz."],["Estoy hecho polvo.","Estou morto de cansaço."],["¡Ni modo!","Fazer o quê! (México)"],["Echar una mano.","Dar uma mão, ajudar."],["Tomar el pelo.","Zoar alguém de brincadeira."],["¿Qué onda?","E aí? (México)"],["No pasa nada.","Não tem problema."],["Ponerse las pilas.","Se esforçar, ficar esperto."],["Estar en las nubes.","Estar distraído."],["¡Dale!","Bora! / Beleza! (Argentina)"],["Más vale tarde que nunca.","Antes tarde do que nunca."],["Tener buena onda.","Ser gente boa."],["¡Buen provecho!","Bom apetite!"]],
  fr:[["C'est pas grave.","Não tem problema."],["Ça marche !","Combinado! / Beleza!"],["Je suis crevé.","Estou morto de cansaço."],["J'ai la flemme.","Estou com preguiça."],["Ça coûte les yeux de la tête.","Custa os olhos da cara."],["Ça me dit !","Topo! / Me interessa!"],["Quoi de neuf ?","Quais as novidades?"],["Poser un lapin.","Dar um bolo em alguém."],["Bon courage !","Força! / Boa sorte!"],["Avoir le cafard.","Estar pra baixo."],["C'est le fun !","É divertido! (Québec)"],["À tout à l'heure !","Até daqui a pouco!"],["Il pleut des cordes.","Está chovendo canivete."],["Bon appétit !","Bom apetite!"]]
};
const FRIEND_STARTERS={en:["Hi! How are you doing today?","What did you do this weekend?","Let's practice English together!"],es:["¡Hola! ¿Qué tal tu día?","¿Qué hiciste el fin de semana?","¡Practiquemos español juntos!"],fr:["Salut ! Ça va aujourd'hui ?","Tu as fait quoi ce week-end ?","On pratique le français ensemble ?"]};
const RETRY_BY={
  es:[["Perdón, no te he entendido. ¿Me lo repites?","Desculpe, não entendi. Pode repetir?"],["Mmm, no estoy seguro de entenderte. ¿Lo dices de otra forma?","Hum, não sei se entendi. Pode dizer de outro jeito?"],["¿Perdón? Si te atascas, toca una de las sugerencias de abajo.","Como? Se travar, toque numa das sugestões abaixo."]],
  fr:[["Pardon, je n'ai pas compris. Vous pouvez répéter ?","Desculpe, não entendi. Pode repetir?"],["Hmm, je ne suis pas sûr de comprendre. Vous pouvez le dire autrement ?","Hum, não sei se entendi. Pode dizer de outro jeito?"],["Pardon ? Si vous bloquez, touchez une des suggestions en bas.","Como? Se travar, toque numa das sugestões abaixo."]]
};
const ENDLINE={en:["That's the end of this conversation. Want to try again?","Essa conversa terminou. Quer tentar de novo?"],es:["Esta conversación ha terminado. ¿Quieres intentarlo otra vez?","Essa conversa terminou. Quer tentar de novo?"],fr:["Cette conversation est terminée. Tu veux recommencer ?","Essa conversa terminou. Quer tentar de novo?"]};
const langOf=k=>(PEOPLE[k]&&PEOPLE[k].lang)||state.lang||"en";
const LG=k=>LANGS[langOf(k)];

const LEVELS = {
  beginner:"The learner is a BEGINNER: use short sentences, very common words, one question at a time, no idioms.",
  intermediate:"The learner is INTERMEDIATE: speak naturally with everyday vocabulary and occasional common idioms.",
  advanced:"The learner is ADVANCED: speak like a native, with natural idioms, phrasal verbs and fast casual rhythm."
};
const PHRASES=[
  ["Break a leg!","Boa sorte! (dito antes de uma apresentação)"],["It's a piece of cake.","É muito fácil."],["I'm all ears.","Sou todo ouvidos, pode falar."],
  ["Let's call it a day.","Vamos encerrar por hoje."],["I'm on it!","Já estou cuidando disso!"],["No worries.","Sem problemas, relaxa."],
  ["It's up to you.","Você que decide."],["I'm running late.","Estou atrasado."],["Hang in there!","Aguenta firme!"],
  ["That rings a bell.","Isso me parece familiar."],["Long time no see!","Quanto tempo!"],["I'm down!","Tô dentro!"],
  ["Hit me up later.","Me chama depois."],["What are you up to?","O que você está fazendo?"],["It's not a big deal.","Não é nada demais."],
  ["Better late than never.","Antes tarde do que nunca."],["I'll keep you posted.","Vou te mantendo informado."],["Fair enough.","Justo, faz sentido."],
  ["Count me in!","Pode contar comigo!"],["Sleep on it.","Pense com calma antes de decidir."],["You nailed it!","Você mandou muito bem!"]
];
const PALETTE=[["#0f9d8a","#6366f1"],["#2f86c9","#22d3ee"],["#8b5cf6","#ec4899"],["#f97316","#facc15"],["#16a34a","#14b8a6"],["#db2777","#f59e0b"]];

const $=id=>document.getElementById(id);
let thread,box,send;
let state={open:null,tab:"ai",lang:"en",level:"intermediate",fixes:"on",voice:"off",logs:{},mode:{},prog:{}};
let busy=null, aiOff=false, query="", lastCount=0;
let shownPt=new Set(), trCache={}, trBusy=new Set();
let frState="loading", contacts=[], threads={}, friendMsgs=[], unsubMsgs=null, msgsFor=null, msgsReady=false, sending=false;
const KEY="talktome1";
const isFriend=k=>typeof k==="string"&&k.startsWith("f:");
function load(){
  try{let s=JSON.parse(localStorage.getItem(KEY)||"null"); if(!s){const old=JSON.parse(localStorage.getItem("talkbuddy2")||"null"); if(old&&old.logs) s=old;} if(s&&s.logs) state=Object.assign(state,s);}catch(e){}
  if(state.open&&!PEOPLE[state.open]&&!isFriend(state.open)) state.open=null;
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
const log=k=>(state.logs[k]=state.logs[k]||[]);

function el(t,c,x){const e=document.createElement(t); if(c)e.className=c; if(x!=null)e.textContent=x; return e;}
function hhmm(t){return new Date(t||Date.now()).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});}
function dayKey(t){const d=new Date(t); return d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate();}
function dayLabel(t){const d=new Date(t), n=new Date(), y=new Date(); y.setDate(n.getDate()-1);
  if(d.toDateString()===n.toDateString()) return "Hoje"; if(d.toDateString()===y.toDateString()) return "Ontem";
  return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric"});}
function hash(s){let h1=0xdeadbeef,h2=0x41c6ce57;for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,2654435761);h2=Math.imul(h2^c,1597334677);}h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0);}

/* ---------- avatares ilustrados ---------- */
function faceSVG(p,uid){
  const f=p.face, id="g"+(uid||Math.random().toString(36).slice(2,8));
  const H=f.hair, S=f.skin;
  let back="", front="";
  if(f.style==="long"){ back=`<path d="M15 31C15 14 49 14 49 31L50 54Q32 59 14 54Z" fill="${H}"/>`; front=`<path d="M19 28C20 17 28 14 34 14C42 15 46 20 45 28C40 21 30 20 19 28Z" fill="${H}"/>`; }
  else if(f.style==="short"){ front=`<path d="M19 29C17 16 26 12 33 12C42 12 48 18 45 29C43 22 36 20 30 21C25 22 21 24 19 29Z" fill="${H}"/>`; }
  else if(f.style==="buzz"){ front=`<path d="M19.5 27C19 17 26 14.5 32 14.5C38 14.5 45 17 44.5 27C40 22 24 22 19.5 27Z" fill="${H}"/>`; }
  else if(f.style==="bun"){ back=`<circle cx="32" cy="11" r="6.5" fill="${H}"/>`; front=`<path d="M19 29C18 17 26 14 32 14C39 14 46 17 45 29C42 22 36 19 32 19C27 19 22 22 19 29Z" fill="${H}"/>`; }
  else if(f.style==="curly"){ back=`<g fill="${H}"><circle cx="20" cy="22" r="7"/><circle cx="27" cy="15" r="7.5"/><circle cx="36" cy="14" r="7.5"/><circle cx="44" cy="21" r="7"/><circle cx="17" cy="31" r="5.5"/><circle cx="47" cy="31" r="5.5"/></g>`; }
  else if(f.style==="bald"){ back=`<g fill="${H}"><ellipse cx="19.5" cy="28" rx="3" ry="6"/><ellipse cx="44.5" cy="28" rx="3" ry="6"/></g>`; }
  else if(f.style==="cap"){ front=`<path d="M18 25C18 12 46 12 46 25Z" fill="#1e3a8a"/><rect x="14" y="23.5" width="36" height="4" rx="2" fill="#172554"/><circle cx="32" cy="18.5" r="2.6" fill="#facc15"/>`; }
  const beard=f.beard?`<path d="M20.5 33C21 45 27 48 32 48C37 48 43 45 43.5 33C41 40 36 41.5 32 41.5C28 41.5 23 40 20.5 33Z" fill="${H}"/>`:"";
  const glasses=f.glasses?`<g fill="none" stroke="#1f2937" stroke-width="1.6"><circle cx="27" cy="31" r="4.2"/><circle cx="37" cy="31" r="4.2"/><path d="M31.2 31h1.6"/></g>`:"";
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.color2||p.color}"/><stop offset="1" stop-color="${p.color}"/></linearGradient></defs>
<rect width="64" height="64" fill="url(#${id})"/>${back}
<path d="M10 66C12 52 22 47 32 47C42 47 52 52 54 66Z" fill="${f.shirt||"#1f2937"}"/>
<rect x="28" y="40" width="8" height="8" rx="3" fill="${S}"/>
<circle cx="19" cy="32" r="3.2" fill="${S}"/><circle cx="45" cy="32" r="3.2" fill="${S}"/>
<ellipse cx="32" cy="31" rx="13" ry="14.5" fill="${S}"/>${front}${beard}
<circle cx="27" cy="31" r="1.8" fill="#1f2937"/><circle cx="37" cy="31" r="1.8" fill="#1f2937"/>
<circle cx="23.5" cy="36.5" r="2.4" fill="#fb7185" opacity=".28"/><circle cx="40.5" cy="36.5" r="2.4" fill="#fb7185" opacity=".28"/>
<path d="M27.5 38Q32 42 36.5 38" fill="none" stroke="#7c2d12" stroke-width="1.8" stroke-linecap="round"/>${glasses}</svg>`;
}
function avatar(p,size,dot,key){
  const a=el("div","av"+(size?" "+size:""));
  if(p.face) a.innerHTML=faceSVG(p,key?key+(size||""):null);
  else{ a.textContent=(p.name[0]||"?").toUpperCase(); a.style.background="linear-gradient(140deg,"+(p.color2||p.color)+","+p.color+")"; }
  if(dot) a.append(el("span","dot"));
  return a;
}
function friend(uid){const c=contacts.find(x=>x.id===uid); const pal=PALETTE[hash(uid)%PALETTE.length]; return {name:(c&&c.name)||"Amigo",color:pal[0],color2:pal[1]};}
function tint(p){$("chatBox").style.setProperty("--pc",p.color); $("chatBox").style.setProperty("--pc2",p.color2||p.color);}

/* ---------- prompts ---------- */
function systemPrompt(k){
  const N=LG(k).name;
  return `You are role-playing as a real human in a casual text chat. You are ${PEOPLE[k].persona}
Stay fully in character as this person: you have a life, opinions, memories and feelings; never say you are an AI, a bot or a language model, and never break character, even if asked directly — just deflect playfully like a person would.
You speak ${N}. The other person is a Brazilian who is practicing ${N} to become fluent. ${LEVELS[state.level]}
Chat like a friend texting: 1-3 short sentences, react to what they said, share something about yourself, and usually end with a question to keep the conversation going. No lists, no lectures.
Always answer in ${N}. If they write in Portuguese, answer in ${N} and gently encourage them to try in ${N}.

Every reply must be ONLY a JSON object with these keys:
{"reply": "your in-character message in ${N}",
 "reply_pt": "natural Brazilian Portuguese translation of your reply",
 "mine_pt": "natural Brazilian Portuguese translation of the learner's LAST message",
 "errors": [ {"wrong": "the EXACT text copied character-for-character from the learner's LAST message that is wrong (a word or short phrase)", "right": "what it should be", "why": "very short explanation in Brazilian Portuguese (max 15 words)"} ]}
List every real grammar, spelling, vocabulary or very unnatural phrasing mistake in the learner's LAST message only; use [] when there are none. Keep each "wrong" as short as possible and never overlapping. Ignore missing capital letters, missing final punctuation and casual texting style. Never mention or fix mistakes inside "reply" — just keep chatting naturally.`;
}
const cleanErrs=a=>Array.isArray(a)?a.filter(x=>x&&x.wrong&&x.right).slice(0,8).map(x=>({wrong:String(x.wrong).slice(0,200),right:String(x.right).slice(0,200),why:String(x.why||"").slice(0,200)})):[];


/* ---------- modo roteiro (sem IA) ---------- */
const S=window.SCRIPTS||{scenes:{},smalltalk:()=>null};
function hasScript(k){return !!(S.scenes[k]||S.smalltalk(k,PEOPLE[k]&&PEOPLE[k].name));}
function modeOf(k){ if(state.mode[k]) return state.mode[k]; return (PEOPLE[k].rp||aiOff)&&hasScript(k)?"script":"ai"; }
function scriptOf(k){ return S.scenes[k]||S.smalltalk(k,PEOPLE[k].name); }
function tmpl(str,vars){ return String(str).replace(/\{(\w+)\}/g,(m,v)=>vars&&vars[v]!=null?vars[v]:m); }
function norm(t){ return " "+String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’`']/g," ").replace(/[^a-z0-9$\s-]/g," ").replace(/\s+/g," ").trim()+" "; }
function cap(w){ w=String(w||"").replace(/[^A-Za-zÀ-ÿ'-]/g,""); return w? w[0].toUpperCase()+w.slice(1).toLowerCase():""; }
function optsFor(sc,node){ return node.opts||(node.optsFrom&&sc.nodes[node.optsFrom].opts)||[]; }
function matchOpts(sc,node,text,vars){
  const n=norm(text), words=n.trim().split(" ").filter(Boolean);
  for(const o of optsFor(sc,node)){
    let hit=null, kw=null, m=null;
    if(o.re){ m=new RegExp(o.re,"i").exec(text); if(m) hit=true; }
    else if(o.k){ kw=o.k.find(x=>x.includes("$")?n.includes(x):(n.includes(norm(x))||n.includes(norm(x+"s")))); if(kw) hit=true; }
    else if(o.min){ if(words.length>=o.min) hit=true; }
    else if(o.any){ if(words.length) hit=true; }
    if(!hit) continue;
    if(o.set) Object.entries(o.set).forEach(([v,val])=>{
      vars[v]= val==="$k"?kw : val==="$1"?cap(m&&m[1]) : val==="$0"?(m&&m[0]) : val==="$last"?cap(words[words.length-1]) : val;
    });
    return o.go;
  }
  return null;
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function botSay(k,nodeId){
  const sc=scriptOf(k), pr=state.prog[k]; let id=nodeId;
  while(id){
    const node=sc.nodes[id]; pr.node=id;
    const vars=Object.assign({},sc.vars||{},pr.vars);
    const lines=Array.isArray(node.say[0])?node.say:[node.say];
    for(const [en,pt] of lines){
      busy=k; if(state.open===k) render();
      await sleep(Math.min(1800,500+en.length*18));
      log(k).push({role:"assistant",text:tmpl(en,vars),pt:tmpl(pt,vars),t:Date.now(),scripted:true});
      if(state.voice==="on"&&state.open===k) speak(tmpl(en,vars),PEOPLE[k].accent);
      save(); if(state.open===k) render();
    }
    if(node.end){ pr.done=true; log(k).push({role:"event",kind:"done",t:Date.now()}); id=null; }
    else id=node.next||null;
  }
  busy=null; save(); render();
}
function startScript(k,silent){
  state.prog[k]={node:null,vars:{},fails:0,done:false};
  if(!silent&&log(k).length) log(k).push({role:"event",kind:"mode",text:"Roteiro: "+scriptOf(k).title,t:Date.now()});
  save(); botSay(k,scriptOf(k).start);
}
const RETRY=[["Sorry, I didn't catch that. Could you say it again?","Desculpe, não entendi. Pode repetir?"],["Hmm, I'm not sure what you mean. Could you try another way?","Hum, não sei se entendi. Pode tentar de outro jeito?"],["Sorry? You can tap one of the suggestions below if you get stuck.","Como? Se travar, toque numa das sugestões abaixo."]];
async function scriptReply(k,text){
  const sc=scriptOf(k), pr=state.prog[k];
  if(!pr||pr.done){ const [et,ep]=ENDLINE[langOf(k)]; busy=k; render(); await sleep(700); log(k).push({role:"assistant",text:et,pt:ep,t:Date.now(),scripted:true}); busy=null; save(); render(); return; }
  const node=sc.nodes[pr.node];
  const go=matchOpts(sc,node,text,pr.vars);
  if(go){ pr.fails=0; save(); return botSay(k,go); }
  const RT=RETRY_BY[langOf(k)]||RETRY; const [en,pt]=RT[Math.min(pr.fails,RT.length-1)]; pr.fails++;
  busy=k; render(); await sleep(800);
  log(k).push({role:"assistant",text:en,pt,t:Date.now(),scripted:true}); busy=null; save(); render();
}

/* ---------- corretor sem IA (erros comuns de brasileiros) ---------- */
const RULES=[
  [/\b(i|you|we|they) has\b/i,m=>m[1]+" have","Com I/you/we/they usamos have."],
  [/\b(i|you|we|they) (is|was)\b/i,m=>m[1]+" "+(m[1].toLowerCase()==="i"?(m[2].toLowerCase()==="is"?"am":"was"):(m[2].toLowerCase()==="is"?"are":"were")),"Concordância do verbo to be."],
  [/\b(he|she|it) are\b/i,m=>m[1]+" is","Com he/she/it usamos is."],
  [/\b(i|you|we|they) have (\d+) years( old)?\b/i,m=>(m[1]+" "+(m[1].toLowerCase()==="i"?"am":"are")+" "+m[2]+" years old"),"Para idade usamos o verbo to be: I am 20 years old."],
  [/\bi am agree\b|\bi'm agree\b/i,()=>"I agree","Agree já é verbo: não use am antes."],
  [/\b(he|she|it) don't\b/i,m=>m[1]+" doesn't","Com he/she/it usamos doesn't."],
  [/\b(he|she|it) (have|go|do|like|want|work|live|need)\b(?! to be)/i,m=>m[1]+" "+({have:"has",go:"goes",do:"does"}[m[2].toLowerCase()]||m[2]+"s"),"Com he/she/it o verbo ganha -s no presente."],
  [/\bpeople is\b/i,()=>"people are","People é plural: people are."],
  [/\bmore (better|worse|bigger|smaller|easier|harder)\b/i,m=>m[1],"Não use more com comparativos que já terminam em -er."],
  [/\bexplain me\b/i,()=>"explain to me","Em inglês: explain something to someone."],
  [/\bsay me\b/i,()=>"tell me","Para 'me diga' usamos tell me."],
  [/\bi('m| am) (very |so |really )?(exciting|boring|interesting|tiring)\b/i,m=>"I"+m[1]+" "+(m[2]||"")+({exciting:"excited",boring:"bored",tiring:"tired"}[m[3].toLowerCase()]||m[3]),"Para sentimento use -ed (excited); -ing descreve a coisa."],
  [/\bdepends? of\b/i,m=>m[0].replace(/of$/i,"on"),"Depend usa on: depends on."],
  [/\bmake a question\b/i,()=>"ask a question","Em inglês se diz ask a question."],
  [/\b(did|didn't|did not) (went|came|saw|had|made|took|got|ate|bought)\b/i,m=>m[1]+" "+({went:"go",came:"come",saw:"see",had:"have",made:"make",took:"take",got:"get",ate:"eat",bought:"buy"}[m[2].toLowerCase()]),"Depois de did o verbo fica no infinitivo."],
  [/\bcan to\b/i,()=>"can","Depois de can não usamos to."],
  [/\bin the weekend\b/i,()=>"on the weekend","Usamos on the weekend."],
  [/\bhow many years (do )?you have\b/i,()=>"how old are you","Para perguntar idade: How old are you?"],
  [/\binformations\b/i,()=>"information","Information não tem plural."],
  [/\badvices\b/i,()=>"advice","Advice não tem plural."],
  [/\bmarried with\b/i,()=>"married to","Usamos married to."],
  [/\bthere have\b/i,()=>"there is / there are","Para 'tem/existe' usamos there is / there are."],
  [/\bi am with (hunger|thirst|cold|fear|sleep)\b/i,m=>"I'm "+({hunger:"hungry",thirst:"thirsty",cold:"cold",fear:"scared",sleep:"sleepy"}[m[1].toLowerCase()]),"Em inglês usamos adjetivo: I'm hungry."],
  [/\bi('m| am) (\d+) years\b(?! old)/i,m=>m[0]+" old","Complete com old: I'm 20 years old."],
  [/\bwhat means\b/i,()=>"what does … mean","Pergunta com does: What does it mean?"],
  [/\bi (go|went) to home\b/i,m=>"I "+m[1]+" home","Com home não usamos to."],
  [/\bentrance in\b/i,()=>"enter","Para 'entrar em' use enter ou get into."]
];
function localCheck(text){
  const out=[];
  RULES.forEach(([re,fix,why])=>{ const m=re.exec(text); if(m) out.push({wrong:m[0],right:fix(m),why}); });
  return out;
}
function mergeErrs(a,b){ const out=a.slice(); (b||[]).forEach(e=>{ const i=String(e.wrong||""); if(i&&!out.some(x=>x.wrong.includes(i)||i.includes(x.wrong))) out.push(e); }); return out; }

/* ---------- tradução ---------- */
async function translateMsg(key,m,isFriend){
  if(trBusy.has(key)) return;
  const cur=isFriend?trCache[m.id]:m.pt;
  if(cur){ shownPt.has(key)?shownPt.delete(key):shownPt.add(key); return renderChat(); }
  if(trCache[key]&&shownPt.has(key)){ shownPt.delete(key); delete trCache[key]; return renderChat(); }
  shownPt.add(key); trBusy.add(key); renderChat();
  let pt=null;
  try{ pt=Backend.translate?await Backend.translate(m.text,isFriend?state.lang:langOf(state.open)):null; }catch(e){}
  trBusy.delete(key);
  if(pt){ if(isFriend) trCache[m.id]=pt; else { m.pt=pt; save(); } }
  else trCache[key]="(Tradução indisponível agora. Toque de novo para tentar.)";
  renderChat();
}
function trButton(key,m,isFriend){
  const b=el("button","speak tr"); b.type="button"; b.setAttribute("aria-label","Traduzir");
  b.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 4-3 7-6 8"/><path d="M13 21l4-9 4 9M14.5 18h5"/></svg>';
  if(shownPt.has(key)) b.classList.add("on");
  b.onclick=e=>{e.stopPropagation(); translateMsg(key,m,isFriend);}; return b;
}
function trBlock(key,m,isFriend){
  if(!shownPt.has(key)) return null;
  const pt=(isFriend?trCache[m.id]:m.pt)||trCache[key];
  return el("div","trtext",trBusy.has(key)?"Traduzindo…":(pt||""));
}

/* ---------- voz ---------- */
function speak(text,lang){
  try{ if(!("speechSynthesis" in window)) return; speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text), vs=speechSynthesis.getVoices();
    const v=vs.find(v=>v.lang===lang||v.lang===lang.replace("-","_"))||vs.find(v=>v.lang&&v.lang.startsWith("en"));
    if(v)u.voice=v; u.lang=lang; u.rate=state.level==="beginner"?0.85:1; speechSynthesis.speak(u);
  }catch(e){}
}
function speakBtn(text,lang){
  const sp=el("button","speak"); sp.type="button"; sp.setAttribute("aria-label","Ouvir");
  sp.innerHTML='<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';
  sp.onclick=e=>{e.stopPropagation(); speak(text,lang);}; return sp;
}

/* ---------- estatísticas ---------- */
function myMessages(){
  const all=[]; Object.entries(state.logs).forEach(([k,lg])=>{ if(!PEOPLE[k]||PEOPLE[k].lang!==state.lang) return; lg.forEach(m=>{if(m.role==="user") all.push(m);}); });
  return all;
}
function renderStats(){
  const mine=myMessages(), days=new Set(mine.map(m=>dayKey(m.t||0)));
  let streak=0; const d=new Date(); if(!days.has(dayKey(d))) d.setDate(d.getDate()-1);
  while(days.has(dayKey(d))){streak++; d.setDate(d.getDate()-1);}
  const checked=mine.filter(m=>m.checked), perfect=checked.filter(m=>!m.errs||!m.errs.length).length;
  const pct=checked.length?Math.round(perfect*100/checked.length)+"%":"—";
  const S=$("stats"); S.replaceChildren();
  [["🔥",streak,streak===1?"dia seguido":"dias seguidos"],["💬",mine.length,"mensagens"],["✨",pct,"sem erros"]].forEach(([ic,v,l])=>{
    const s=el("div","stat"), b=el("b"); b.append(el("span",null,ic),el("span",null,String(v))); s.append(b,el("span",null,l)); S.append(s);
  });
  const h=new Date().getHours();
  $("greet").textContent=(h<12?"Bom dia":h<18?"Boa tarde":"Boa noite")+"! "+(streak>1?"Não perca sua sequência.":"Bora treinar seu "+LANGS[state.lang].pt+"?");
}

/* ---------- lista ---------- */
function renderLangs(){
  const W=$("langs"); if(!W) return; W.replaceChildren();
  Object.entries(LANGS).forEach(([k,L])=>{
    const b=el("button","lang"+(state.lang===k?" on":"")); b.type="button"; b.setAttribute("aria-pressed",String(state.lang===k));
    b.append(el("span","fl",L.flag),el("span",null,L.label));
    b.onclick=()=>{ if(state.lang===k) return; state.lang=k; if(state.open&&!isFriend(state.open)&&langOf(state.open)!==k){ state.open=null; watchFriend(); } save(); render(); };
    W.append(b);
  });
}
function renderList(){
  renderLangs();
  renderStats();
  $("tabAi").setAttribute("aria-selected",String(state.tab==="ai")); $("tabFr").setAttribute("aria-selected",String(state.tab==="friends"));
  const fc=$("frCount"); fc.hidden=!contacts.length; fc.textContent=contacts.length;
  if(state.tab==="friends") return renderFriends();
  const L=$("list"); L.replaceChildren();
  const q=query.trim().toLowerCase();
  const match=p=>!q||[p.name,p.bio,p.flag,p.hook||"",...p.tags].join(" ").toLowerCase().includes(q);
  if(!q){
    const PH=PHRASES_BY[state.lang]||PHRASES; const [en,pt]=PH[Math.floor(Date.now()/864e5)%PH.length];
    const dl=el("div","daily"); const ic=el("div","ic","💡"); const tx=el("div");
    tx.append(el("small",null,"Frase do dia"),el("div","en",en),el("div","pt",pt)); dl.append(ic,tx,speakBtn(en,LANGS[state.lang].tts)); L.append(dl);
  }
  const rps=Object.entries(PEOPLE).filter(e=>e[1].lang===state.lang&&e[1].rp&&match(e[1]));
  if(rps.length){
    const s=el("div","sec gutter"); s.append(el("h2",null,"Situações reais"),el("span",null,"Roleplay")); L.append(s);
    const car=el("div","carousel gutter");
    rps.forEach(([k,p],i)=>{
      const c=el("button","scard"); c.type="button"; c.style.background=`linear-gradient(150deg,${p.color2},${p.color})`; c.style.animationDelay=(i*50)+"ms";
      c.append(el("span","emoji",p.emoji),el("b",null,p.scene),el("span",null,p.hook),el("span","nofx","Funciona sem IA"));
      const w=el("span","who"); w.append(avatar(p,"",false,k+"c"),document.createTextNode(p.name)); c.append(w);
      c.onclick=()=>openChat(k); car.append(c);
    });
    L.append(car);
  }
  const free=Object.entries(PEOPLE).filter(e=>e[1].lang===state.lang&&!e[1].rp&&match(e[1]));
  if(free.length){
    const s=el("div","sec gutter"); s.append(el("h2",null,"Conversa livre"),el("span",null,"Pessoas de vários países")); L.append(s);
    free.forEach(([k,p],i)=>L.append(contactRow(k,p,i)));
  }
  if(rps.length){
    const s=el("div","sec gutter"); s.append(el("h2",null,"Suas situações"),el("span",null,"Histórico"));
    const started=rps.filter(([k])=>(state.logs[k]||[]).length);
    if(started.length){ L.append(s); started.forEach(([k,p],i)=>L.append(contactRow(k,p,i))); }
  }
  if(!rps.length&&!free.length) L.append(el("p","nores","Ninguém encontrado com “"+query+"”."));
}
function contactRow(k,p,i){
  const lg=state.logs[k]||[], last=lg[lg.length-1];
  const b=el("button","contact"+(state.open===k?" active":"")); b.type="button"; b.onclick=()=>openChat(k); b.style.animationDelay=Math.min(i*35,400)+"ms";
  const tx=el("div","txt"), l1=el("div","l1");
  l1.append(el("span","nm",p.name),el("span","flag"+(p.rp?" rp":""),p.flag),el("span","tm",last?hhmm(last.t):""));
  const pv=el("div","pv");
  if(last){ if(last.role==="user") pv.append(el("span","you","Você: ")); pv.append(document.createTextNode(last.text)); }
  else pv.textContent=p.bio+" · "+p.tags.slice(0,2).join(", ");
  tx.append(l1,pv); b.append(avatar(p,"",!p.rp,k+"l"),tx); return b;
}
function renderFriends(){
  const L=$("list"); L.replaceChildren();
  const card=el("div","invite"); Backend.friends.renderInvite(card,frState); L.append(card);
  const q=query.trim().toLowerCase();
  const list=contacts.filter(c=>!q||c.name.toLowerCase().includes(q)).sort((a,b)=>((threads[b.id]||{}).t||0)-((threads[a.id]||{}).t||0));
  const s=el("div","sec gutter"); s.append(el("h2",null,"Seus contatos"),el("span",null,frState==="loading"?"Carregando…":list.length+" "+(list.length===1?"pessoa":"pessoas"))); L.append(s);
  if(frState!=="loading"&&!list.length){L.append(el("p","nores",q?"Ninguém encontrado com “"+query+"”.":"Nenhum amigo ainda. Convide alguém e treinem juntos!")); return;}
  list.forEach((c,i)=>{
    const f=friend(c.id), d=threads[c.id];
    const b=el("button","contact"+(state.open==="f:"+c.id?" active":"")); b.type="button"; b.onclick=()=>openChat("f:"+c.id); b.style.animationDelay=Math.min(i*35,400)+"ms";
    const tx=el("div","txt"), l1=el("div","l1");
    l1.append(el("span","nm",f.name),el("span","flag real","REAL"),el("span","tm",d&&d.t?hhmm(d.t):""));
    const pv=el("div","pv");
    if(d&&d.last){ if(d.from===Backend.friends.me()) pv.append(el("span","you","Você: ")); pv.append(document.createTextNode(d.last)); }
    else pv.textContent="Toque para dizer oi em "+LANGS[state.lang].pt;
    tx.append(l1,pv); b.append(avatar(f,""),tx); L.append(b);
  });
}

/* ---------- conversa ---------- */
function bubbleUser(m,w,isNew,key,isFr){
  const bub=el("div","bubble"), errs=(state.fixes==="on"&&m.errs)||[], found=[];
  errs.forEach(er=>{const i=m.text.indexOf(er.wrong); if(i>=0&&!found.some(f=>i<f.i+f.er.wrong.length&&f.i<i+er.wrong.length)) found.push({i,er});});
  found.sort((a,b)=>a.i-b.i);
  const info=el("div","fix"); info.hidden=true; const marks=[]; let pos=0;
  found.forEach(({i,er})=>{
    bub.append(document.createTextNode(m.text.slice(pos,i)));
    const mk=el("mark","err",er.wrong); mk.tabIndex=0; mk.setAttribute("role","button"); mk.setAttribute("aria-label","Ver erro: "+er.wrong);
    const show=()=>{const was=mk.classList.contains("on"); marks.forEach(x=>x.classList.remove("on")); if(was){info.hidden=true;return;}
      mk.classList.add("on"); info.replaceChildren(); const pr=el("div","pair"); pr.append(el("s",null,er.wrong),el("span",null,"→"),el("span","right",er.right)); info.append(pr); if(er.why) info.append(el("div",null,er.why)); info.hidden=false;};
    mk.onclick=show; mk.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();show();}};
    marks.push(mk); bub.append(mk); pos=i+er.wrong.length;
  });
  bub.append(document.createTextNode(m.text.slice(pos)));
  const meta=el("span","meta"); meta.append(trButton(key,m,isFr),document.createTextNode(hhmm(m.t)));
  if(m.checked){const tk=el("span","tick"); tk.innerHTML='<svg width="16" height="11" viewBox="0 0 16 11" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M1 6l3 3 6-7M6 9l1 1 7-8"/></svg>'; meta.append(tk);}
  const tb=trBlock(key,m,isFr); bub.append(meta); if(tb) bub.append(tb); w.append(bub);
  if(found.length){w.append(el("span","errnote",found.length===1?"1 erro · toque no trecho sublinhado":found.length+" erros · toque nos trechos sublinhados")); w.append(info);}
  else if(state.fixes==="on"&&m.checked&&m.verified!==false&&m.errs&&!m.errs.length){w.append(el("span","perfect"+(isNew?" new":""),"✓ Perfeito!"));}
}
function setHeader(p,status,typing,key){
  tint(p);
  $("cName").textContent=p.name;
  const av=avatar(p,"sm",false,key&&key+"h"); av.id="cAv"; $("cAv").replaceWith(av);
  const st=$("cStatus"); st.textContent=status; st.className="st"+(typing?" typing-st":"");
  document.querySelectorAll(".seg").forEach(s=>s.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String((s.dataset.key==="mode"?(state.open&&!isFriend(state.open)?modeOf(state.open):""):state[s.dataset.key])===b.dataset.v))));
}
function drawMessages(list,isMine,lang,keyOf,isFr){
  let lastDay="", lastRole="";
  list.forEach((m,idx)=>{
    if(m.role==="event"){ thread.append(eventCard(m)); lastRole=""; return; }
    const mine=isMine(m), isNew=idx>=lastCount;
    const d=dayLabel(m.t||Date.now()); if(d!==lastDay){thread.append(el("div","day",d)); lastDay=d; lastRole="";}
    const role=mine?"me":"them";
    const row=el("div","row "+role+(role!==lastRole?" first":"")+(isNew?" new":"")); lastRole=role;
    const w=el("div","msg"); row.append(w);
    const key=keyOf(m,idx);
    if(mine) bubbleUser(m,w,isNew,key,isFr);
    else{ const bub=el("div","bubble",m.text), meta=el("span","meta"); meta.append(trButton(key,m,isFr),speakBtn(m.text,lang),document.createTextNode(hhmm(m.t))); bub.append(meta); const tb=trBlock(key,m,isFr); if(tb) bub.append(tb); w.append(bub); }
    thread.append(row);
  });
  lastCount=list.length; return lastRole;
}
function eventCard(m){
  const k=state.open;
  if(m.kind==="mode") return el("div","day",m.text);
  const c=el("div","done");
  c.append(el("div","big","🎉"),el("b",null,"Conversa concluída!"),el("span",null,"Mandou bem! Repita para fixar as frases ou converse livremente com a IA."));
  const row=el("div","btns2");
  const again=el("button","pillbtn","Repetir"); again.type="button"; again.onclick=()=>{ if(!busy) startScript(k); };
  row.append(again);
  if(!aiOff){ const ai=el("button","pillbtn alt","Conversar com IA"); ai.type="button"; ai.onclick=()=>setMode(k,"ai"); row.append(ai); }
  c.append(row); return c;
}
function renderHints(){
  const H=$("hints"); if(!H) return; H.replaceChildren();
  const k=state.open;
  if(!k||isFriend(k)||modeOf(k)!=="script"){ H.hidden=true; return; }
  const pr=state.prog[k], sc=scriptOf(k);
  const node=pr&&!pr.done&&pr.node&&sc.nodes[pr.node];
  const hints=node&&(node.hints||(node.optsFrom&&sc.nodes[node.optsFrom].hints));
  if(!hints||busy){ H.hidden=true; return; }
  H.hidden=false;
  H.append(el("span","hl","Sugestões"));
  hints.forEach(([en,pt])=>{ const b=el("button","hint"); b.type="button"; b.append(el("b",null,en),el("small",null,pt)); b.onclick=()=>{ box.value=en; autosize(); try{box.focus();}catch(e){} }; H.append(b); });
}
function setMode(k,mode){
  if(modeOf(k)===mode){ state.mode[k]=mode; save(); closeMenu(); return render(); }
  state.mode[k]=mode; save(); closeMenu();
  if(mode==="script") startScript(k);
  else { log(k).push({role:"event",kind:"mode",text:"Conversa livre com IA",t:Date.now()}); save(); render(); }
}
function profileCard(p,key,sub,how,starters){
  const c=el("div","profile"); c.append(el("div","banner"),avatar(p,"xl",!p.rp&&!!p.face,key&&key+"p"),el("h2",null,p.name),el("p",null,sub));
  if(p.tags){const tg=el("div","tags"); tg.append(el("span","flag"+(p.rp?" rp":""),p.flag)); p.tags.forEach(t=>tg.append(el("span","flag",t))); c.append(tg);}
  c.append(el("p","how",how));
  const ss=el("div","starters");
  starters.forEach(t=>{const b=el("button","starter"); b.type="button"; b.append(el("span",null,t)); const ar=el("span","go","→"); ar.setAttribute("aria-hidden","true"); b.append(ar); b.onclick=()=>{box.value=t; submit();}; ss.append(b);});
  c.append(ss); return c;
}
function renderChat(){
  const k=state.open;
  $("levelField").hidden=isFriend(k); $("clear").hidden=isFriend(k);
  thread.replaceChildren();
  if(isFriend(k)) return renderFriendChat(k.slice(2));
  const p=PEOPLE[k], lg=log(k), mode=modeOf(k);
  box.placeholder="Mensagem em "+LG(k).pt;
  $("modeField").hidden=!hasScript(k);
  setHeader(p,busy===k?"digitando…":(mode==="script"?"Roteiro · "+scriptOf(k).title+" · sem IA":(p.rp?p.scene+" · IA livre":"online · IA livre")),busy===k,k);
  if(mode==="script"&&(!state.prog[k])){ startScript(k,true); return; }
  if(mode==="script") thread.append(el("div","sys","Modo roteiro (sem IA): responda em "+LG(k).pt+". Se travar, toque numa sugestão."));
  else if(!lg.length) thread.append(profileCard(p,k,p.bio,p.rp?"Roleplay: viva a situação de verdade, em "+LG(k).pt+". Seus erros ficam sublinhados; toque neles para ver a correção.":"Converse como se estivesse mandando mensagem para um amigo. Seus erros ficam sublinhados; toque neles para ver a correção.",p.starters));
  const lastRole=drawMessages(lg,m=>m.role==="user",p.accent,(m,i)=>k+":"+i,false);
  if(busy===k){const row=el("div","row them"+(lastRole!=="them"?" first":"")); const w=el("div","msg"); const b=el("div","bubble typing"); b.append(el("span"),el("span"),el("span")); w.append(b); row.append(w); thread.append(row);}
  if(aiOff&&mode==="ai"){
    const n=el("div","sys",(Backend.aiOffMessage||"A IA não está disponível agora.")+(hasScript(k)?" Ou use o modo Roteiro no menu ⋮.":""));
    if(Backend.openSettings){ const b=el("button","pillbtn","Adicionar minha conta de IA"); b.type="button"; b.style.marginTop="8px"; b.onclick=()=>Backend.openSettings(); n.append(el("br"),b); }
    thread.append(n);
  }
  send.disabled=!!busy||(aiOff&&mode==="ai");
  renderHints();
  thread.scrollTop=thread.scrollHeight;
}
function renderFriendChat(uid){
  const f=friend(uid);
  setHeader(f,"Contato real · conversem em "+LANGS[state.lang].pt,false); box.placeholder="Mensagem em "+LANGS[state.lang].pt;
  if(msgsReady&&!friendMsgs.length) thread.append(profileCard(f,null,"Contato real","Combinem de falar só em "+LANGS[state.lang].pt+". Seus erros ficam sublinhados só para você; toque neles para ver a correção.",FRIEND_STARTERS[state.lang]));
  if(!msgsReady) thread.append(el("div","day","Carregando mensagens…"));
  drawMessages(friendMsgs.map(m=>Object.assign({},m,{checked:true})),m=>m.from===Backend.friends.me(),LANGS[state.lang].tts,m=>"f:"+m.id,true);
  if(frState==="off") thread.append(el("div","sys",Backend.friendsOffMessage||"Amigos reais não estão disponíveis agora."));
  else if(frState==="readonly") thread.append(el("div","sys","Você pode ler, mas não mandar mensagens aqui."));
  send.disabled=sending||frState!=="ready";
  $("modeField").hidden=true; renderHints();
  thread.scrollTop=thread.scrollHeight;
}
let animated=false;
function render(){
  if(!state.open&&$("hints")) $("hints").hidden=true;
  if(!animated){animated=true; $("list").classList.add("anim"); setTimeout(()=>$("list").classList.remove("anim"),1200);}
  $("app").classList.toggle("has-open",!!state.open);
  $("noChat").hidden=!!state.open; $("chatBox").hidden=!state.open;
  renderList();
  if(state.open) renderChat();
}
function watchFriend(){
  const k=state.open, uid=isFriend(k)?k.slice(2):null;
  if(msgsFor===uid) return;
  if(unsubMsgs){unsubMsgs(); unsubMsgs=null;}
  msgsFor=uid; friendMsgs=[]; msgsReady=false;
  if(!uid||frState==="off"||frState==="loading") return;
  let first=true;
  unsubMsgs=Backend.friends.watch(uid,list=>{
    const me=Backend.friends.me();
    const fresh=!first&&list.length>friendMsgs.length&&list[list.length-1].from!==me;
    friendMsgs=list; msgsReady=true;
    if(fresh&&state.voice==="on") speak(list[list.length-1].text,LANGS[state.lang].tts);
    if(first) lastCount=list.length; first=false;
    if(state.open==="f:"+uid) renderChat();
  });
}
function openChat(k){ if(state.open!==k){ lastCount=isFriend(k)?0:(state.logs[k]||[]).length; } state.open=k; save(); closeMenu(); $("voicetip").hidden=true; watchFriend(); render(); }
function sysNote(t){thread.append(el("div","sys",t)); thread.scrollTop=thread.scrollHeight;}
const ERR={key:"Sua chave de IA foi recusada. Confira na engrenagem ⚙ da tela inicial.",rate:"Muitas mensagens seguidas. Espere um pouco e envie de novo.",auth:"Sua sessão expirou. Entre de novo e reenvie.",error:"A mensagem não foi enviada. Toque em enviar de novo."};

async function submit(){
  if(isFriend(state.open)) return submitFriend();
  const k=state.open, text=box.value.trim();
  if(!k||!text||busy) return;
  if(modeOf(k)==="script") return submitScript(k,text);
  if(aiOff) return;
  box.value=""; autosize(); $("voicetip").hidden=true;
  const lg=log(k); lg.push({role:"user",text,t:Date.now()}); busy=k; save(); render();
  const turns=lg.filter(m=>m.role==="user"||m.role==="assistant").slice(-30).map(m=>({role:m.role,content:m.text}));
  try{
    const out=await Backend.ai(systemPrompt(k),turns);
    const me=lg[lg.length-1]; me.checked=true; me.errs=cleanErrs(out&&out.errors); if(out&&out.mine_pt) me.pt=String(out.mine_pt);
    const reply=String(out&&out.reply||"").trim();
    if(reply){ lg.push({role:"assistant",text:reply,pt:out.reply_pt?String(out.reply_pt):undefined,t:Date.now()}); if(state.voice==="on"&&state.open===k) speak(reply,PEOPLE[k].accent); }
  }catch(e){
    busy=null; const c=(e&&e.code)||"error";
    if(c==="off"){ const last=lg.pop(); lastCount=lg.length; aiOff=true; save(); render(); if(state.open===k&&last){box.value=last.text; autosize();} return; }
    const last=lg.pop(); lastCount=lg.length; save(); render(); if(state.open===k){box.value=last?last.text:""; autosize();}
    sysNote(ERR[c]||ERR.error); return;
  }
  busy=null; save(); render();
}
async function submitScript(k,text){
  box.value=""; autosize(); $("voicetip").hidden=true;
  const me={role:"user",text,t:Date.now(),checked:true,errs:langOf(k)==="en"?localCheck(text):[],verified:false};
  log(k).push(me); save(); render();
  if(state.fixes==="on"&&Backend.grammar) Backend.grammar(text,LG(k).lt).then(extra=>{ me.errs=mergeErrs(me.errs,cleanErrs(extra)); me.verified=true; save(); if(state.open===k) renderChat(); }).catch(()=>{});
  await scriptReply(k,text);
}
async function submitFriend(){
  const uid=state.open.slice(2), text=box.value.trim();
  if(!text||sending||frState!=="ready") return;
  sending=true; box.value=""; autosize(); $("voicetip").hidden=true;
  let msgId;
  try{ msgId=await Backend.friends.send(uid,text.slice(0,4000)); }
  catch(e){
    sending=false; if(e&&e.code==="readonly"){frState="readonly"; render(); return;}
    render(); box.value=text; autosize(); sysNote(e&&e.code==="full"?"O espaço de mensagens encheu. Apague conversas antigas.":ERR.error); return;
  }
  sending=false; render();
  if(state.fixes==="on"){
    const L=LANGS[state.lang], local=state.lang==="en"?localCheck(text):[];
    const ai=(!aiOff&&Backend.check)?Backend.check(text,L.name).catch(()=>Backend.grammar?Backend.grammar(text,L.lt):[]):(Backend.grammar?Backend.grammar(text,L.lt):Promise.resolve([]));
    Promise.resolve(ai).catch(()=>[]).then(extra=>{ const errs=mergeErrs(cleanErrs(extra),local); return Backend.friends.setErrs(uid,msgId,errs); }).catch(()=>{});
  }
}
function autosize(){box.style.height="auto"; box.style.height=Math.min(box.scrollHeight,130)+"px"; const has=!!box.value.trim(); send.hidden=!has; $("mic").hidden=has;}
function closeMenu(){$("menu").hidden=true; $("confirmBox").hidden=true; $("menuBtn").setAttribute("aria-expanded","false");}

function wire(){
  thread=$("thread"); box=$("box"); send=$("send");
  $("q").addEventListener("input",e=>{query=e.target.value; renderList();});
  document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{state.tab=b.dataset.tab; save(); renderList();});
  $("back").onclick=()=>{state.open=null; save(); closeMenu(); watchFriend(); render();};
  $("menuBtn").onclick=e=>{e.stopPropagation(); const m=$("menu"); m.hidden=!m.hidden; $("confirmBox").hidden=true; $("menuBtn").setAttribute("aria-expanded",String(!m.hidden));};
  $("menu").onclick=e=>e.stopPropagation();
  document.addEventListener("click",closeMenu);
  document.querySelectorAll(".seg").forEach(s=>s.addEventListener("click",e=>{const b=e.target.closest("button"); if(!b) return;
    if(s.dataset.key==="mode"){ if(state.open&&!isFriend(state.open)&&!busy) setMode(state.open,b.dataset.v); return; }
    state[s.dataset.key]=b.dataset.v; save(); if(state.open) renderChat();}));
  $("clear").onclick=()=>{$("confirmBox").hidden=false;};
  $("no").onclick=()=>{$("confirmBox").hidden=true;};
  $("yes").onclick=()=>{if(state.open&&!isFriend(state.open)&&!busy){ state.logs[state.open]=[]; delete state.prog[state.open]; } lastCount=0; save(); closeMenu(); render();};
  $("mic").onclick=()=>{ $("voicetip").hidden=false; try{box.focus();}catch(e){} };
  $("tipOk").onclick=()=>{ $("voicetip").hidden=true; try{box.focus();}catch(e){} };
  $("form").addEventListener("submit",e=>{e.preventDefault(); submit();});
  box.addEventListener("input",autosize);
  box.addEventListener("keydown",e=>{if(e.key==="Enter"&&!e.shiftKey&&!matchMedia("(pointer:coarse)").matches){e.preventDefault(); submit();}});
}

window.startApp=function(){
  load(); wire();
  if(state.open&&!isFriend(state.open)) lastCount=(state.logs[state.open]||[]).length;
  render();
  Backend.onAiState=on=>{aiOff=!on; if(state.open&&!isFriend(state.open)) renderChat();};
  if(Backend.openSettings){
    const g=el("button","gear"); g.type="button"; g.setAttribute("aria-label","Minha conta de IA");
    g.innerHTML='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>';
    g.onclick=()=>Backend.openSettings();
    document.querySelector(".brandrow").append(g);
  }
  Backend.friends.start({
    onState:s=>{frState=s; watchFriend(); renderList(); if(isFriend(state.open)) renderChat();},
    onContacts:list=>{contacts=list; renderList(); if(isFriend(state.open)) renderChat();},
    onThreads:map=>{threads=map; renderList();}
  });
};
})();
