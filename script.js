const btnFotos = document.getElementById("btn-fotos");
const modalFotos = document.getElementById("modal-fotos");
const modalClose = document.getElementById("modal-close");
const modalOk = document.getElementById("modal-ok");

const form = document.getElementById("inscricaoForm");
const formStatus = document.getElementById("formStatus");

const popupEnvio = document.getElementById("popup-envio");
const popupEnvioFechar = document.getElementById("popup-envio-fechar");
const popupEnvioOk = document.getElementById("popup-envio-ok");
const hiddenIframe = document.getElementById("hidden_iframe");

let formularioEnviado = false;
let sectionViewSent = new Set();
let scrollCheckpointsSent = new Set();

function pushDataLayer(payload) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function getStoredUtm() {
  try {
    return JSON.parse(localStorage.getItem("utm_data") || "{}");
  } catch (error) {
    return {};
  }
}

function abrirModalFotos() {
  if (!modalFotos) return;
  modalFotos.classList.add("active");
  document.body.classList.add("modal-open");
}

function fecharModalFotos() {
  if (!modalFotos) return;
  modalFotos.classList.remove("active");
  document.body.classList.remove("modal-open");
}

function mostrarPopupEnvio() {
  if (!popupEnvio) return;
  popupEnvio.classList.add("active");
  document.body.classList.add("modal-open");
}

function fecharPopupEnvio() {
  if (!popupEnvio) return;
  popupEnvio.classList.remove("active");
  document.body.classList.remove("modal-open");
}

// Captura UTM da URL e salva apenas se existir
(function capturarUTM() {
  const params = new URLSearchParams(window.location.search);

  const hasUtm =
    params.get("utm_source") ||
    params.get("utm_medium") ||
    params.get("utm_campaign");

  if (!hasUtm) return;

  const utmData = {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign")
  };

  localStorage.setItem("utm_data", JSON.stringify(utmData));

  pushDataLayer({
    event: "utm_visit",
    utm_source: utmData.utm_source,
    utm_medium: utmData.utm_medium,
    utm_campaign: utmData.utm_campaign
  });
})();

// Modal de fotos
if (btnFotos) {
  btnFotos.addEventListener("click", function (e) {
    e.preventDefault();
    abrirModalFotos();
  });
}

if (modalClose) {
  modalClose.addEventListener("click", fecharModalFotos);
}

if (modalOk) {
  modalOk.addEventListener("click", fecharModalFotos);
}

if (modalFotos) {
  modalFotos.addEventListener("click", function (e) {
    if (e.target === modalFotos) {
      fecharModalFotos();
    }
  });
}

// Popup envio
if (popupEnvioFechar) {
  popupEnvioFechar.addEventListener("click", fecharPopupEnvio);
}

if (popupEnvioOk) {
  popupEnvioOk.addEventListener("click", fecharPopupEnvio);
}

if (popupEnvio) {
  popupEnvio.addEventListener("click", function (e) {
    if (e.target === popupEnvio) {
      fecharPopupEnvio();
    }
  });
}

// Fechar no ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharModalFotos();
    fecharPopupEnvio();
  }
});

// Submit do formulário
if (form) {
  form.addEventListener("submit", function (e) {
    const nome = document.getElementById("nome")?.value.trim();
    const email = document.getElementById("email")?.value.trim();

    if (!nome || !email) {
      e.preventDefault();
      if (formStatus) {
        formStatus.textContent = "Preencha nome e e-mail.";
      }
      return;
    }

    const utm = getStoredUtm();

    pushDataLayer({
      event: "form_submit",
      section: "participar",
      label: "formulario_inscricao",
      text: "Enviar",
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null
    });

    if (formStatus) {
      formStatus.textContent = "Enviando...";
    }

    formularioEnviado = true;
  });
}

// Sucesso do formulário via iframe
if (hiddenIframe) {
  hiddenIframe.addEventListener("load", function () {
    if (!formularioEnviado) return;

    const utm = getStoredUtm();

    pushDataLayer({
      event: "form_success",
      form_name: "inscricao",
      section: "participar",
      label: "formulario_inscricao_sucesso",
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null
    });

    if (formStatus) {
      formStatus.textContent = "";
    }

    if (form) {
      form.reset();
    }

    mostrarPopupEnvio();
    formularioEnviado = false;
  });
}

// Reveal animation
const revealElements = document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right"
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  }
);

revealElements.forEach((element) => {
  revealObserver.observe(element);
});

// Tracking de cliques com data-track
document.addEventListener("click", function (e) {
  const el = e.target.closest("[data-track]");
  if (!el) return;

  const utm = getStoredUtm();

  pushDataLayer({
    event: el.getAttribute("data-track"),
    section: el.getAttribute("data-section"),
    label: el.getAttribute("data-label"),
    text: (el.innerText || "").trim(),
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null
  });
});

// Scroll tracking (25%, 50%, 75%, 100%)
(function trackScrollDepth() {
  const checkpoints = [25, 50, 75, 100];

  window.addEventListener("scroll", function () {
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;

    const scrollTop = window.scrollY;
    const scrollPercent = Math.round((scrollTop / docHeight) * 100);

    checkpoints.forEach((point) => {
      if (scrollPercent >= point && !scrollCheckpointsSent.has(point)) {
        scrollCheckpointsSent.add(point);

        pushDataLayer({
          event: "scroll_depth",
          percent: point
        });
      }
    });
  });
})();

// Visualização de seção
(function trackSectionViews() {
  const sections = document.querySelectorAll("[data-section]");

  if (!sections.length) return;

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sectionName = entry.target.getAttribute("data-section");
        if (!sectionName || sectionViewSent.has(sectionName)) return;

        sectionViewSent.add(sectionName);

        pushDataLayer({
          event: "section_view",
          section: sectionName
        });
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });
})();