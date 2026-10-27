/* Edición Vinoteca Jesús Gómez: misma app, datos y marca aparte. La de José no entra aquí. */
(function () {
  const jesus = typeof window !== "undefined" && window.CASA_EDITION === "jesus";
  if (typeof addI18n === "function") {
    addI18n([
      ["jesus.nameCave", "Añade el nombre de tu vinoteca", "Afegeix el nom de la teva vinoteca", "Add your cellar's name", "Ajoutez le nom de votre cave", "Adicione o nome da sua adega"],
      ["jesus.pendingLead", "Puedes crear y nombrar vinotecas, con armarios, baldas y huecos.", "Pots crear i anomenar vinoteques, amb armaris, lleixes i forats.", "You can create and name cellars, with cabinets, shelves and slots.", "Vous pouvez créer et nommer des caves, avec armoires, étagères et emplacements.", "Pode criar e nomear adegas, com armários, prateleiras e lugares."],
      ["jesus.slots", "Huecos", "Forats", "Slots", "Emplacements", "Lugares"],
      ["jesus.keyTitle", "Clave Gemini", "Clau Gemini", "Gemini key", "Clé Gemini", "Chave Gemini"],
      ["jesus.keyLead", "Pega tu clave de AI Studio. No hay ninguna precargada.", "Enganxa la teva clau d'AI Studio. No n'hi ha cap de precarregada.", "Paste your AI Studio key. None is preloaded.", "Collez votre clé AI Studio. Aucune n'est préchargée.", "Cole a sua chave do AI Studio. Nenhuma vem pré-carregada."],
      ["jesus.keyPh", "Pega tu clave", "Enganxa la teva clau", "Paste your key", "Collez votre clé", "Cole a sua chave"],
      ["jesus.keySave", "Guardar clave", "Desar la clau", "Save key", "Enregistrer la clé", "Guardar chave"]
    ]);
  }
  if (!jesus) return;
  if (typeof addI18n === "function") {
    addI18n([
      ["home.h1", "Vinoteca Jesús Gómez", "Vinoteca Jesús Gómez", "Vinoteca Jesús Gómez", "Vinoteca Jesús Gómez", "Vinoteca Jesús Gómez"],
      ["notify.denied", "El iPhone ha bloqueado los avisos. Ajustes → Notificaciones → Vinoteca Jesús Gómez.", "L'iPhone ha blocat els avisos. Ajustos → Notificacions → Vinoteca Jesús Gómez.", "The iPhone has blocked notices. Settings → Notifications → Vinoteca Jesús Gómez.", "L'iPhone a bloqué les alertes. Réglages → Notifications → Vinoteca Jesús Gómez.", "O iPhone bloqueou os avisos. Ajustes → Notificações → Vinoteca Jesús Gómez."],
      ["profile.schema", "Esquema jesus.vinoteca.pro.max.v3 · {b} botellas · {w} vinos · {c} vinotecas", "Esquema jesus.vinoteca.pro.max.v3 · {b} ampolles · {w} vins · {c} vinoteques", "Schema jesus.vinoteca.pro.max.v3 · {b} bottles · {w} wines · {c} cellars", "Schéma jesus.vinoteca.pro.max.v3 · {b} bouteilles · {w} vins · {c} caves", "Esquema jesus.vinoteca.pro.max.v3 · {b} garrafas · {w} vinhos · {c} adegas"]
    ]);
  }

  function retarget(img) {
    if (!img || img.dataset.casaAsset === "1") return;
    const src = img.getAttribute("src") || "";
    if (!src || /^(https?:|data:|blob:|#|\/|\.\.\/|asset\/)/.test(src)) return;
    img.dataset.casaAsset = "1";
    img.setAttribute("src", "../" + src);
  }
  function armAssets() {
    document.querySelectorAll("img").forEach(retarget);
    if (window.__casaAssetObserver) return;
    window.__casaAssetObserver = new MutationObserver(list => {
      list.forEach(rec => {
        if (rec.type === "attributes" && rec.target && rec.target.tagName === "IMG") retarget(rec.target);
        (rec.addedNodes || []).forEach(node => {
          if (!node || node.nodeType !== 1) return;
          if (node.tagName === "IMG") retarget(node);
          if (node.querySelectorAll) node.querySelectorAll("img").forEach(retarget);
        });
      });
    });
    window.__casaAssetObserver.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["src"] });
  }
  function paintBrand() {
    document.title = "Vinoteca Jesús Gómez";
    document.querySelectorAll(".brand-sub").forEach(el => { el.textContent = "Vinoteca Jesús Gómez"; });
    document.querySelectorAll("#home .home-hero h1").forEach(el => { el.textContent = "Vinoteca Jesús Gómez"; });
    document.querySelectorAll(".home-hero-photo").forEach(el => el.remove());
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => { paintBrand(); armAssets(); });
  else { paintBrand(); armAssets(); }

  function jesusKeyCard() {
    const saved = typeof storedGeminiKey === "function" ? storedGeminiKey() : "";
    return `<div class="card" id="jesus-key">
      <h3>${t("jesus.keyTitle")}</h3>
      <p class="muted" style="margin-top:6px">${t("jesus.keyLead")}</p>
      <label class="field"><span>${t("jesus.keyTitle")}</span><input id="jesus-gemini-key" type="password" autocomplete="off" placeholder="${t("jesus.keyPh")}" value=""></label>
      <button type="button" class="btn btn-gold" style="width:100%" onclick="saveJesusGeminiKey()">${t("jesus.keySave")}</button>
      <p class="tiny" id="jesus-key-state" style="margin-top:8px">${saved ? "···" + String(saved).slice(-4) : ""}</p>
    </div>`;
  }
  if (typeof renderPerfil === "function") {
    const renderPerfilJesus = renderPerfil;
    renderPerfil = function () {
      renderPerfilJesus();
      const body = document.getElementById("perfil-body");
      if (!body || document.getElementById("jesus-key")) return;
      const backup = body.querySelector("[onclick*=\"backup\"]");
      const html = jesusKeyCard();
      if (backup) backup.insertAdjacentHTML("beforebegin", html);
      else body.insertAdjacentHTML("beforeend", html);
    };
  }
  if (typeof renderHome === "function") {
    const renderHomeJesus = renderHome;
    renderHome = function () {
      renderHomeJesus();
      paintBrand();
      const host = document.getElementById("home-kpis");
      if (!host || document.getElementById("jesus-key-home") || (typeof storedGeminiKey === "function" && storedGeminiKey())) return;
      host.insertAdjacentHTML("afterend", `<div class="card" id="jesus-key-home" role="button" onclick="show('perfil')"><h3>${t("jesus.keyTitle")}</h3><p class="muted" style="margin-top:6px">${t("jesus.keyLead")}</p></div>`);
    };
  }
  window.saveJesusGeminiKey = function () {
    const typed = document.getElementById("jesus-gemini-key");
    const value = typed ? String(typed.value || "").trim() : "";
    const keyEl = document.getElementById("p-gemini-key");
    const box = document.getElementById("p-gemini");
    if (keyEl) keyEl.value = value;
    if (box) box.checked = !!value;
    if (typeof savePriceCfg === "function") savePriceCfg();
    if (typeof renderPerfil === "function" && document.getElementById("perfil") && document.getElementById("perfil").classList.contains("active")) renderPerfil();
  };
})();
