// Instalação no celular: registra o service worker e mostra um aviso "Instalar app".
// Android/Chrome: botão que abre o instalador do sistema.
// iPhone/Safari: explica o caminho Compartilhar → Adicionar à Tela de Início.
(function () {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) return;
  let dismissed = false;
  try { dismissed = localStorage.getItem("ttm-install-dismissed") === "1"; } catch (e) {}
  if (dismissed) return;

  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = isIOS && !/CriOS|FxiOS|EdgiOS/.test(ua);
  let deferred = null;

  function banner(text, action) {
    if (document.getElementById("installBanner")) return;
    const hero = document.querySelector(".hero");
    if (!hero) return;
    const b = document.createElement("div");
    b.id = "installBanner"; b.className = "install";
    const ic = document.createElement("img"); ic.src = "/icons/icon-192.png"; ic.alt = ""; ic.width = 44; ic.height = 44;
    const tx = document.createElement("div");
    const t1 = document.createElement("b"); t1.textContent = "Instale o Talk to me";
    const t2 = document.createElement("span"); t2.innerHTML = text;
    tx.append(t1, t2);
    b.append(ic, tx);
    if (action) { const btn = document.createElement("button"); btn.type = "button"; btn.className = "pillbtn"; btn.textContent = "Instalar"; btn.onclick = action; b.append(btn); }
    const x = document.createElement("button"); x.type = "button"; x.className = "close"; x.setAttribute("aria-label", "Fechar"); x.textContent = "×";
    x.onclick = () => { b.remove(); try { localStorage.setItem("ttm-install-dismissed", "1"); } catch (e) {} };
    b.append(x);
    hero.after(b);
  }

  window.addEventListener("beforeinstallprompt", e => {
    e.preventDefault(); deferred = e;
    const show = () => banner("Abra direto da tela inicial, como um app.", async () => {
      deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null;
      const b = document.getElementById("installBanner"); if (b) b.remove();
    });
    document.getElementById("app") && !document.getElementById("app").hidden ? show() : setTimeout(show, 2500);
  });
  window.addEventListener("appinstalled", () => { const b = document.getElementById("installBanner"); if (b) b.remove(); });

  if (isIOS) {
    const msg = isSafari
      ? 'Toque em <b>Compartilhar</b> <span aria-hidden="true">⎋</span> e depois em <b>Adicionar à Tela de Início</b>.'
      : 'Abra este link no <b>Safari</b> para instalar no iPhone.';
    const wait = () => { const app = document.getElementById("app"); if (app && !app.hidden) banner(msg); else setTimeout(wait, 1000); };
    setTimeout(wait, 1500);
  }
})();
