/* Backend da versão independente:
   - Login com Google (Firebase Auth)
   - Contatos e chat em tempo real (Cloud Firestore)
   - IA: chave própria de cada pessoa (Gemini, Claude ou ChatGPT, direto do navegador)
     ou, se o dono ativou, a IA do app pela rota /api/chat */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, orderBy, limit, onSnapshot, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { PROVIDERS, loadAi, saveAi, clearAi, callProvider } from "./ai-providers.js";

const app = initializeApp(firebaseConfig);
// Sessão salva no aparelho: a pessoa continua conectada até tocar em "Sair".
const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
  popupRedirectResolver: browserPopupRedirectResolver
});
auth.languageCode = "pt";
let pendingName = "";
const db = getFirestore(app);
const $ = id => document.getElementById(id);

let me = null, myCode = null, handlers = null, started = false;
const names = {};

/* ---------- IA ---------- */
let serverAi = null; // a IA do app (servidor) está configurada?
async function checkServer() {
  if (serverAi !== null) return serverAi;
  try { const r = await fetch("/api/chat"); const j = await r.json(); serverAi = !!j.configured; }
  catch (e) { serverAi = false; }
  return serverAi;
}
async function callApi(system, messages) {
  const cfg = loadAi();
  if (cfg.provider !== "server" && cfg.key) return callProvider(cfg, system, messages);
  if (!(await checkServer())) throw { code: "off" };
  return callServer(system, messages);
}
async function callServer(system, messages) {
  const token = await auth.currentUser.getIdToken();
  let r;
  try {
    r = await fetch("/api/chat", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: "Bearer " + token },
      body: JSON.stringify({ system, messages })
    });
  } catch (e) { throw { code: "error" }; }
  if (r.status === 401) throw { code: "auth" };
  if (r.status === 429) throw { code: "rate" };
  if (r.status === 503) throw { code: "off" };
  if (!r.ok) throw { code: "error" };
  const j = await r.json();
  return j.data;
}

/* ---------- utilidades ---------- */
const threadId = uid => [me, uid].sort().join("_");
function makeCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = ""; for (let i = 0; i < 6; i++) s += A[Math.floor(Math.random() * A.length)];
  return s;
}
function displayNameOf(user) {
  return (pendingName || user.displayName || (user.email ? user.email.split("@")[0] : "") || "Sem nome").slice(0, 40);
}
async function ensureProfile(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data().code) {
    myCode = snap.data().code;
    await updateDoc(ref, { name: displayNameOf(user), seen: Date.now() });
    return;
  }
  for (let i = 0; i < 5; i++) {
    const c = makeCode();
    const cref = doc(db, "codes", c);
    if ((await getDoc(cref)).exists()) continue;
    await setDoc(cref, { uid: user.uid });
    myCode = c;
    break;
  }
  await setDoc(ref, { name: displayNameOf(user), code: myCode, createdAt: Date.now(), seen: Date.now() }, { merge: true });
}
async function addByCode(raw) {
  const code = String(raw || "").trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(code)) throw new Error("O código tem 6 letras ou números.");
  if (code === myCode) throw new Error("Esse é o seu próprio código.");
  const snap = await getDoc(doc(db, "codes", code));
  if (!snap.exists()) throw new Error("Código não encontrado. Confira e tente de novo.");
  const other = snap.data().uid;
  await setDoc(doc(db, "users", me, "contacts", other), { at: Date.now() });
  await setDoc(doc(db, "users", other, "contacts", me), { at: Date.now() });
  return other;
}
async function nameOf(uid) {
  if (names[uid] !== undefined) return names[uid];
  try { const s = await getDoc(doc(db, "users", uid)); names[uid] = (s.exists() && s.data().name) || ""; }
  catch (e) { names[uid] = ""; }
  return names[uid];
}

/* ---------- Backend usado pelo core.js ---------- */
window.Backend = {
  aiOffMessage: "Para conversar com a IA, adicione sua conta de IA na engrenagem ⚙ (o Gemini tem plano gratuito).",
  openSettings: () => openSettings(),
  friendsOffMessage: "Não foi possível conectar. Verifique sua internet e entre de novo.",
  async ai(system, turns) { return callApi(system, turns); },
  async check(text, langName) {
    const N = langName || "English";
    const sys = `A Brazilian is practicing ${N}. Find every real grammar, spelling, vocabulary or very unnatural phrasing mistake in the user's ${N} message. Ignore missing capital letters, missing accents on casual words, missing final punctuation and casual texting style.
Reply with ONLY a JSON array (use [] if there are no mistakes) of objects: {"wrong": "the EXACT text copied character-for-character from the message (a word or short phrase, never overlapping)", "right": "what it should be", "why": "very short explanation in Brazilian Portuguese (max 15 words)"}`;
    return callApi(sys, [{ role: "user", content: text }]);
  },
  // Tradução sem IA: MyMemory (gratuito, com limite diário). Se falhar, usa a IA.
  // lang = idioma estudado ("en", "es" ou "fr")
  async translate(text, lang) {
    const L = lang || "en";
    const N = ({ en: "English", es: "Spanish", fr: "French" })[L] || "English";
    const pt = /\b(eu|você|voce|não|nao|com|obrigad[oa]|está|tudo|bem|então|tô|vc)\b/i.test(text);
    try {
      const r = await fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text.slice(0, 450)) + "&langpair=" + (pt ? "pt-BR|" + L : L + "|pt-BR"));
      const j = await r.json();
      const t = j && j.responseData && j.responseData.translatedText;
      if (t && j.responseStatus === 200) return t;
    } catch (e) {}
    try {
      const out = await callApi("Translate the user's message into natural Brazilian Portuguese if it is not in Portuguese, or into natural " + N + " if it is in Portuguese. Reply with ONLY a JSON object: {\"t\": \"the translation\"}", [{ role: "user", content: text }]);
      return out && out.t;
    } catch (e) { return null; }
  },
  // Correção sem IA: LanguageTool (corretor gramatical de código aberto). lt = "en-US", "es" ou "fr"
  async grammar(text, lt) {
    const body = new URLSearchParams({ text, language: lt || "en-US", motherTongue: "pt-BR" });
    const r = await fetch("https://api.languagetool.org/v2/check", { method: "POST", body });
    if (!r.ok) return [];
    const j = await r.json();
    const skip = ["TYPOGRAPHY", "CASING", "PUNCTUATION"];
    return (j.matches || [])
      .filter(m => !skip.includes(m.rule && m.rule.category && m.rule.category.id) && m.rule.id !== "UPPERCASE_SENTENCE_START" && m.replacements && m.replacements.length)
      .map(m => ({ wrong: text.substr(m.offset, m.length), right: m.replacements[0].value, why: m.message }));
  },
  friends: {
    me: () => me,
    start(h) {
      handlers = h;
      h.onState("ready");
      onSnapshot(collection(db, "users", me, "contacts"), async s => {
        const ids = s.docs.map(d => d.id);
        h.onContacts(ids.map(id => ({ id, name: names[id] || "" })));
        await Promise.all(ids.map(nameOf));
        h.onContacts(ids.map(id => ({ id, name: names[id] || "" })));
      }, () => h.onState("off"));
      onSnapshot(query(collection(db, "threads"), where("members", "array-contains", me)), s => {
        const m = {};
        s.docs.forEach(d => { const v = d.data(); const other = (v.members || []).find(x => x !== me); if (other) m[other] = v; });
        h.onThreads(m);
      }, () => {});
      // link de convite: ?convite=CODIGO
      const inv = new URLSearchParams(location.search).get("convite");
      if (inv) {
        history.replaceState(null, "", location.pathname);
        addByCode(inv).then(uid => { h.toast && h.toast("Contato adicionado!"); }).catch(() => {});
      }
    },
    watch(uid, cb) {
      const q = query(collection(db, "threads", threadId(uid), "messages"), orderBy("t", "desc"), limit(200));
      return onSnapshot(q, s => cb(s.docs.map(d => Object.assign({ id: d.id }, d.data())).reverse()), () => cb([]));
    },
    async send(uid, text) {
      const tid = threadId(uid), t = Date.now();
      try {
        const ref = await addDoc(collection(db, "threads", tid, "messages"), { from: me, text, t });
        await setDoc(doc(db, "threads", tid), { members: [me, uid], last: text.slice(0, 140), from: me, t });
        return ref.id;
      } catch (e) { throw { code: "error" }; }
    },
    setErrs(uid, msgId, errs) { return updateDoc(doc(db, "threads", threadId(uid), "messages", msgId), { errs }); },
    renderInvite(card) {
      const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
      card.append(el("h3", null, "Treine com amigos de verdade"));
      card.append(el("p", null, "Mande seu código ou o link de convite. Quando seu amigo entrar, vocês aparecem um para o outro."));
      const row = el("div", "code"); row.append(el("b", null, myCode || "……"));
      const share = el("button", "pillbtn", "Convidar"); share.type = "button";
      const link = location.origin + "/?convite=" + myCode;
      share.onclick = async () => {
        const text = "Bora treinar inglês comigo no Talk to me? Meu código: " + myCode;
        try {
          if (navigator.share) { await navigator.share({ title: "Talk to me", text, url: link }); return; }
          await navigator.clipboard.writeText(text + "\n" + link); share.textContent = "Link copiado!";
          setTimeout(() => share.textContent = "Convidar", 2000);
        } catch (e) {}
      };
      row.append(share); card.append(row);
      const add = el("form", "addrow");
      const inp = el("input"); inp.id = "addCode"; inp.placeholder = "Código do amigo"; inp.maxLength = 6; inp.autocomplete = "off";
      const btn = el("button", "pillbtn alt", "Adicionar"); btn.type = "submit";
      const msg = el("p"); msg.hidden = true;
      add.append(inp, btn);
      add.onsubmit = async e => {
        e.preventDefault(); btn.disabled = true; msg.hidden = false; msg.className = ""; msg.textContent = "Procurando…";
        try { await addByCode(inp.value); msg.textContent = "Contato adicionado! Ele já aparece na sua lista."; inp.value = ""; }
        catch (err) { msg.className = "warn"; msg.textContent = err.message || "Não deu certo. Tente de novo."; }
        btn.disabled = false;
      };
      card.append(add, msg);
    }
  }
};


/* ---------- tela "Minha conta de IA" ---------- */
async function openSettings() {
  const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  const old = $("aiSheet"); if (old) old.remove();
  const cfg = loadAi();
  const hasServer = await checkServer();
  let provider = cfg.provider !== "server" ? cfg.provider : (hasServer ? "server" : "gemini");

  const wrap = el("div", "sheet"); wrap.id = "aiSheet";
  const card = el("div", "sheetcard"); card.setAttribute("role", "dialog"); card.setAttribute("aria-label", "Minha conta de IA");
  const head = el("div", "sheethead");
  head.append(el("h2", null, "Minha conta de IA"));
  const close = el("button", "icon", "×"); close.type = "button"; close.setAttribute("aria-label", "Fechar"); close.onclick = () => wrap.remove();
  head.append(close);
  card.append(head, el("p", "muted", "Use sua própria chave de IA. Assim cada pessoa usa os próprios limites, e o modo Roteiro continua funcionando sem IA."));

  const list = el("div", "provlist");
  const opts = (hasServer ? [["server", { name: "IA do app", tag: "Oferecida pelo dono do app" }]] : []).concat(Object.entries(PROVIDERS));
  const body = el("div", "provbody");
  function draw() {
    list.replaceChildren();
    opts.forEach(([id, p]) => {
      const b = el("button", "prov" + (provider === id ? " on" : "")); b.type = "button";
      b.append(el("b", null, p.name), el("span", null, p.tag));
      b.onclick = () => { provider = id; draw(); };
      list.append(b);
    });
    body.replaceChildren();
    if (provider === "server") { body.append(el("p", "muted", "Você vai usar a IA que o dono do app deixou ativada. Pode parar de funcionar se o limite dele acabar.")); return; }
    const P = PROVIDERS[provider];
    const same = cfg.provider === provider;
    const how = el("p", "muted"); how.append(document.createTextNode(P.keyHint + " "));
    const a = el("a", null, "Abrir página da chave"); a.href = P.keyUrl; a.target = "_blank"; a.rel = "noopener"; how.append(a);
    const keyLab = el("label", "fieldlab", "Chave de API"); keyLab.htmlFor = "aiKey";
    const keyRow = el("div", "keyrow");
    const key = el("input"); key.id = "aiKey"; key.type = "password"; key.autocomplete = "off"; key.spellcheck = false; key.placeholder = P.placeholder; key.value = same ? (cfg.key || "") : "";
    const eye = el("button", "pillbtn alt", "Mostrar"); eye.type = "button";
    eye.onclick = () => { key.type = key.type === "password" ? "text" : "password"; eye.textContent = key.type === "password" ? "Mostrar" : "Ocultar"; };
    keyRow.append(key, eye);
    const modLab = el("label", "fieldlab", "Modelo (pode deixar o padrão)"); modLab.htmlFor = "aiModel";
    const model = el("input"); model.id = "aiModel"; model.autocomplete = "off"; model.spellcheck = false; model.value = (same && cfg.model) || P.model;
    body.append(how, keyLab, keyRow, modLab, model);
  }
  draw();

  const msg = el("p", "sheetmsg"); msg.hidden = true;
  const actions = el("div", "btns2");
  const saveBtn = el("button", "pillbtn", "Testar e salvar"); saveBtn.type = "button";
  const rmBtn = el("button", "pillbtn alt", "Remover minha chave"); rmBtn.type = "button"; rmBtn.hidden = !(cfg.key);
  actions.append(saveBtn, rmBtn);
  saveBtn.onclick = async () => {
    msg.hidden = false; msg.className = "sheetmsg";
    if (provider === "server") { saveAi({ provider: "server" }); msg.textContent = "Pronto! Usando a IA do app."; window.Backend.onAiState && window.Backend.onAiState(true); return; }
    const k = ($("aiKey").value || "").trim(), m = ($("aiModel").value || "").trim();
    if (k.length < 10) { msg.className = "sheetmsg warn"; msg.textContent = "Cole a chave de API completa."; return; }
    saveBtn.disabled = true; msg.textContent = "Testando a chave…";
    const test = { provider, key: k, model: m || PROVIDERS[provider].model };
    try {
      const out = await callProvider(test, 'Reply with {"ok": true}', [{ role: "user", content: "ping" }]);
      if (!out) throw { code: "error" };
      saveAi(test);
      msg.textContent = "Chave funcionando! Já pode conversar com a IA."; rmBtn.hidden = false;
      window.Backend.onAiState && window.Backend.onAiState(true);
      setTimeout(() => wrap.remove(), 1200);
    } catch (e) {
      msg.className = "sheetmsg warn";
      msg.textContent = e && e.code === "key" ? "A chave ou o modelo foi recusado. Confira se copiou a chave inteira e se o modelo existe."
        : e && e.code === "rate" ? "A chave funciona, mas o limite de uso acabou por agora. Tente mais tarde ou confira seu plano."
        : "Não foi possível testar agora. Verifique a internet e tente de novo.";
    }
    saveBtn.disabled = false;
  };
  rmBtn.onclick = () => {
    clearAi(); msg.hidden = false; msg.className = "sheetmsg"; msg.textContent = "Chave removida deste aparelho."; rmBtn.hidden = true;
    if ($("aiKey")) $("aiKey").value = "";
  };

  const privacy = el("p", "muted small", "Sua chave fica salva só neste aparelho e vai direto para o provedor escolhido. Ela não passa pelo servidor do app. Dica: defina um limite de gastos na conta do provedor.");
  card.append(list, body, actions, msg, privacy);
  const u = auth.currentUser;
  if (u) card.append(el("p", "muted small", "Conectado como " + (u.email || u.displayName || "você") + ". A sessão fica salva neste aparelho."));
  const out = el("button", "linkbtn", "Sair da conta do app"); out.type = "button";
  out.onclick = () => signOut(auth).then(() => location.reload());
  card.append(out);
  wrap.append(card);
  wrap.onclick = e => { if (e.target === wrap) wrap.remove(); };
  document.body.append(wrap);
}

/* ---------- login ---------- */
let signup = false;
function setMsg(text, err) { const m = $("loginMsg"); m.textContent = text || ""; m.className = "authmsg" + (err ? " err" : ""); }
function setTab(isSignup) {
  signup = isSignup;
  $("tabLogin").setAttribute("aria-selected", String(!isSignup));
  $("tabSignup").setAttribute("aria-selected", String(isSignup));
  $("authName").hidden = $("nameLab").hidden = !isSignup;
  $("authGo").textContent = isSignup ? "Criar conta" : "Entrar";
  $("forgot").hidden = isSignup;
  $("authPass").autocomplete = isSignup ? "new-password" : "current-password";
  setMsg("");
}
const AUTH_ERR = {
  "auth/invalid-email": "Esse e-mail não parece válido.",
  "auth/missing-password": "Digite sua senha.",
  "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
  "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Toque em Entrar.",
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "Não achamos conta com esse e-mail. Toque em Criar conta.",
  "auth/too-many-requests": "Muitas tentativas. Espere alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão. Verifique a internet.",
  "auth/operation-not-allowed": "O login por e-mail ainda não foi ativado no Firebase."
};
const errText = e => AUTH_ERR[e && e.code] || "Não deu certo. Tente de novo.";

$("tabLogin").onclick = () => setTab(false);
$("tabSignup").onclick = () => setTab(true);
$("showPass").onclick = () => {
  const p = $("authPass"); p.type = p.type === "password" ? "text" : "password";
  $("showPass").textContent = p.type === "password" ? "Mostrar" : "Ocultar";
};
$("authForm").onsubmit = async e => {
  e.preventDefault();
  const email = $("authEmail").value.trim(), pass = $("authPass").value, name = $("authName").value.trim();
  if (signup && !name) return setMsg("Digite seu nome.", true);
  if (!email) return setMsg("Digite seu e-mail.", true);
  if (pass.length < 6) return setMsg("A senha precisa ter pelo menos 6 caracteres.", true);
  $("authGo").disabled = true; setMsg(signup ? "Criando sua conta…" : "Entrando…");
  try {
    if (signup) {
      pendingName = name;
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name }).catch(() => {});
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  } catch (err) { pendingName = ""; setMsg(errText(err), true); }
  $("authGo").disabled = false;
};
$("forgot").onclick = async () => {
  const email = $("authEmail").value.trim();
  if (!email) return setMsg("Digite seu e-mail acima e toque de novo em Esqueci minha senha.", true);
  try { await sendPasswordResetEmail(auth, email); setMsg("Enviamos um link para criar uma senha nova. Confira seu e-mail (e o spam)."); }
  catch (err) { setMsg(errText(err), true); }
};
$("googleBtn").onclick = async () => {
  setMsg("Abrindo o Google…");
  const provider = new GoogleAuthProvider();
  // App instalado na tela inicial (principalmente iPhone) costuma bloquear janelas pop-up:
  // nesse caso o login abre na mesma tela e volta para o app.
  const installed = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  try {
    if (installed) await signInWithRedirect(auth, provider);
    else await signInWithPopup(auth, provider);
  } catch (e) {
    if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
      try { await signInWithRedirect(auth, provider); return; } catch (e2) {}
    }
    if (e && e.code === "auth/popup-closed-by-user") return setMsg("");
    setMsg("Não foi possível entrar com o Google. Use e-mail e senha.", true);
  }
};
onAuthStateChanged(auth, async user => {
  $("loadingMsg").hidden = true;
  if (!user) {
    $("login").hidden = false; $("app").hidden = true;
    $("authCard").hidden = false; $("keepNote").hidden = false;
    return;
  }
  me = user.uid;
  try { await ensureProfile(user); } catch (e) { console.error(e); }
  pendingName = "";
  $("login").hidden = true; $("app").hidden = false;
  if (!started) { started = true; window.startApp(); }
});
