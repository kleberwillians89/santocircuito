const btnFotos = document.getElementById("btn-fotos");
const modalFotos = document.getElementById("modal-fotos");
const modalClose = document.getElementById("modal-close");
const modalOk = document.getElementById("modal-ok");

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

const form = document.getElementById("inscricaoForm");
const formStatus = document.getElementById("formStatus");

const popupEnvio = document.getElementById("popup-envio");
const popupEnvioFechar = document.getElementById("popup-envio-fechar");
const popupEnvioOk = document.getElementById("popup-envio-ok");
const hiddenIframe = document.getElementById("hidden_iframe");

let formularioEnviado = false;

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

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharModalFotos();
    fecharPopupEnvio();
  }
});

function getStoredUtm() {
  return JSON.parse(localStorage.getItem("utm_data") || "{}");
}

// Captura UTM da URL e salva apenas se existir
(function () {
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

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "utm_visit",
    utm_source: utmData.utm_source,
    utm_medium: utmData.utm_medium,
    utm_campaign: utmData.utm_campaign
  });
})();

if (form) {
  form.addEventListener("submit", function (e) {
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!nome || !email) {
      e.preventDefault();
      formStatus.textContent = "Preencha nome e e-mail.";
      return;
    }

    const utm = getStoredUtm();

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "form_submit",
      section: "participar",
      label: "formulario_inscricao",
      text: "Enviar",
      utm_source: utm.utm_source || null,
      utm_medium: utm.utm_medium || null,
      utm_campaign: utm.utm_campaign || null
    });

    formStatus.textContent = "Enviando...";
    formularioEnviado = true;
  });
}

if (hiddenIframe) {
  hiddenIframe.addEventListener("load", function () {
    if (formularioEnviado) {
      formStatus.textContent = "";
      form.reset();
      mostrarPopupEnvio();
      formularioEnviado = false;
    }
  });
}

const revealElements = document.querySelectorAll(
  ".reveal, .reveal-left, .reveal-right"
);

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
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

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: el.getAttribute("data-track"),
    section: el.getAttribute("data-section"),
    label: el.getAttribute("data-label"),
    text: (el.innerText || "").trim(),
    utm_source: utm.utm_source || null,
    utm_medium: utm.utm_medium || null,
    utm_campaign: utm.utm_campaign || null
  });
});