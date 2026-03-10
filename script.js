const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const mobileNav = document.getElementById("mobileNav");
const revealItems = document.querySelectorAll(".reveal");
const yearEl = document.getElementById("year");

/* ----- Google Form: zapis do Twojego formularza (bez logo, bez „Wyczyść”) ----- */
const GOOGLE_FORM_ACTION = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSc0S1AyTNnOzpvLbndvXT7xbXMglpZd4mIF6i2Hq8nMJjpNCA/formResponse";
/** Wklej tutaj pełną wartość „send_to” z Google Ads (Konwersje → Twoja akcja → Zainstaluj tag ręcznie), np. "AW-18006328915/AbCdEfGh". Zostaw pusty, jeśli nie używasz konwersji formularza. */
const GOOGLE_ADS_FORM_CONVERSION_SEND_TO = "AW-18006328915/oSZ5COXjhIYcENOMi4pD";
const GOOGLE_FORM_ENTRIES = {
  imie: "entry.802299419",
  nazwisko: "entry.391572716",
  email: "entry.880540214",
  telefon: "entry.1612311520",
  wiadomosc: "entry.936444586"
};

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener("click", () => {
    const isOpen = mobileNav.classList.toggle("is-open");
    mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
    mobileMenuBtn.setAttribute("aria-label", isOpen ? "Zamknij menu" : "Otwórz menu");
  });

  mobileNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("is-open");
      mobileMenuBtn.setAttribute("aria-expanded", "false");
      mobileMenuBtn.setAttribute("aria-label", "Otwórz menu");
    });
  });
}

/* ----- Active section in nav (desktop + mobile) ----- */
const sectionIds = ["offer", "process", "pricing", "opinions", "contact"];
const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
/** Set of section ids currently intersecting the "active" zone (top 200px of viewport) */
const intersectingSections = new Set();

function setActiveNavFromIntersecting() {
  const activeId = sectionIds.find((id) => intersectingSections.has(id)) || sectionIds[0];
  navLinks.forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === "#" + activeId;
    link.classList.toggle("is-active", isActive);
    link.setAttribute("aria-current", isActive ? "true" : null);
  });
}

if ("IntersectionObserver" in window && navLinks.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          intersectingSections.add(id);
        } else {
          intersectingSections.delete(id);
        }
      });
      setActiveNavFromIntersecting();
    },
    { rootMargin: "-200px 0px 0px 0px", threshold: 0 }
  );
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (section) navObserver.observe(section);
  });
  setActiveNavFromIntersecting();
}


if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* ----- Formularz kontaktowy: wysyłka do Google Forms ----- */
const contactForm = document.getElementById("contactForm");
const contactFormStatus = document.getElementById("contactFormStatus");
const contactFormSubmit = document.getElementById("contactFormSubmit");
const contactNameInput = contactForm && contactForm.querySelector('[name="name"]');
const contactEmailInput = contactForm && contactForm.querySelector('[name="email"]');
const contactPhoneInput = contactForm && contactForm.querySelector('[name="phone"]');
const contactMessageInput = contactForm && contactForm.querySelector('[name="message"]');

if (contactForm && contactFormStatus && contactFormSubmit) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = (contactNameInput && contactNameInput.value) || "";
    const email = (contactEmailInput && contactEmailInput.value) || "";
    const phone = (contactPhoneInput && contactPhoneInput.value) || "";
    const message = (contactMessageInput && contactMessageInput.value) || "";
    const nameParts = name.trim().split(/\s+/);
    const imie = nameParts[0] || "";
    const nazwisko = nameParts.slice(1).join(" ") || "";

    contactFormSubmit.disabled = true;
    contactFormStatus.hidden = false;
    contactFormStatus.textContent = "Wysyłanie…";
    contactFormStatus.className = "contact-form-status contact-form-status--sending";

    const formData = new FormData();
    formData.append(GOOGLE_FORM_ENTRIES.imie, imie);
    formData.append(GOOGLE_FORM_ENTRIES.nazwisko, nazwisko);
    formData.append(GOOGLE_FORM_ENTRIES.email, email);
    formData.append(GOOGLE_FORM_ENTRIES.telefon, phone);
    formData.append(GOOGLE_FORM_ENTRIES.wiadomosc, message);

    try {
      await fetch(GOOGLE_FORM_ACTION, { method: "POST", mode: "no-cors", body: formData });
      contactFormStatus.textContent = "Wiadomość wysłana. Odpiszę najszybciej jak to możliwe.";
      contactFormStatus.className = "contact-form-status contact-form-status--success";
      contactForm.reset();
      if (GOOGLE_ADS_FORM_CONVERSION_SEND_TO) {
        if (typeof gtag === "function") {
          gtag("event", "conversion", {
            send_to: GOOGLE_ADS_FORM_CONVERSION_SEND_TO,
            value: 1.0,
            currency: "PLN"
          });
        } else {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push([
            "event",
            "conversion",
            {
              send_to: GOOGLE_ADS_FORM_CONVERSION_SEND_TO,
              value: 1.0,
              currency: "PLN"
            }
          ]);
        }
      }
    } catch (err) {
      contactFormStatus.textContent = "Błąd wysyłania. Spróbuj napisać na adres e-mail lub zadzwonić.";
      contactFormStatus.className = "contact-form-status contact-form-status--error";
    }
    contactFormSubmit.disabled = false;
  });
}

/* ----- Google Ads: zdarzenie przy kliknięciu „Skontaktuj się” ----- */
document.querySelectorAll('a[href="#contact"]').forEach((link) => {
  link.addEventListener("click", () => {
    if (typeof gtag === "function") {
      gtag("event", "contact_click", { event_category: "engagement", event_label: "Skontaktuj się" });
    }
  });
});

/* =========================
   WARM NEURON BACKGROUND (deferred to avoid blocking LCP)
========================= */
const canvas = document.getElementById("neuronCanvas");

function initNeuronCanvas() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes = [];
  /** @type {Map<string, number[]>} spatial grid: cellKey -> node indices */
  let grid = new Map();
  const LINK_DISTANCE = 96;
  const CELL_SIZE = 96;
  const INFLUENCE_RADIUS = 180;
  const IDLE_MS = 2500;
  const IDLE_FRAME_MS = 500;
  const useShadowBlur = !(navigator.hardwareConcurrency <= 4 || window.innerWidth < 768);

  let mouse = {
    x: -1000,
    y: -1000,
    active: false
  };
  let lastMouseTime = 0;
  let rafId = 0;
  let timeoutId = 0;

  function resizeCanvas() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    createNodes();
  }

  function cellKey(cx, cy) {
    return `${cx},${cy}`;
  }

  function createNodes() {
    nodes = [];
    const spacing = window.innerWidth < 768 ? 90 : 60;

    for (let x = 0; x <= w + spacing; x += spacing) {
      for (let y = 0; y <= h + spacing; y += spacing) {
        nodes.push({
          x: x + (Math.random() - 0.5) * 18,
          y: y + (Math.random() - 0.5) * 18,
          baseR: Math.random() * 1.2 + 1.2,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    grid = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const nx = nodes[i].x;
      const ny = nodes[i].y;
      const cx = Math.floor(nx / CELL_SIZE);
      const cy = Math.floor(ny / CELL_SIZE);
      const key = cellKey(cx, cy);
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(i);
    }
  }

  function setMouse(x, y) {
    mouse.x = x;
    mouse.y = y;
    mouse.active = true;
    lastMouseTime = performance.now();
  }

  window.addEventListener("mousemove", (e) => {
    setMouse(e.clientX, e.clientY);
  });

  window.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches && e.touches[0]) {
        setMouse(e.touches[0].clientX, e.touches[0].clientY);
      }
    },
    { passive: true }
  );

  window.addEventListener("mouseleave", () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  window.addEventListener("touchend", () => {
    mouse.active = false;
    mouse.x = -1000;
    mouse.y = -1000;
  });

  function getNeighborIndices(i) {
    const a = nodes[i];
    const cx = Math.floor(a.x / CELL_SIZE);
    const cy = Math.floor(a.y / CELL_SIZE);
    const out = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const list = grid.get(cellKey(cx + dx, cy + dy));
        if (list) {
          for (const j of list) {
            if (j > i) out.push(j);
          }
        }
      }
    }
    return out;
  }

  function draw(time) {
    if (document.visibilityState !== "visible") return;

    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      const neighbors = getNeighborIndices(i);

      for (const j of neighbors) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > LINK_DISTANCE) continue;

        let glow = 0;
        if (mouse.active) {
          const da = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          const db = Math.hypot(b.x - mouse.x, b.y - mouse.y);
          const ga = da < INFLUENCE_RADIUS ? 1 - da / INFLUENCE_RADIUS : 0;
          const gb = db < INFLUENCE_RADIUS ? 1 - db / INFLUENCE_RADIUS : 0;
          glow = Math.max(ga, gb);
        }

        const alpha = 0.045 + (1 - dist / LINK_DISTANCE) * 0.055 + glow * 0.42;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(132, 165, 255, ${alpha})`;
        ctx.lineWidth = glow > 0.15 ? 1.5 : 1;

        if (useShadowBlur && glow > 0.5) {
          ctx.shadowBlur = 10 + glow * 20;
          ctx.shadowColor = "rgba(255, 214, 164, 0.95)";
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    for (const node of nodes) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 0.002 + node.phase);

      let glow = 0;
      if (mouse.active) {
        const dist = Math.hypot(node.x - mouse.x, node.y - mouse.y);
        if (dist < INFLUENCE_RADIUS) {
          glow = 1 - dist / INFLUENCE_RADIUS;
        }
      }

      const r = node.baseR + pulse * 0.45 + glow * 2.9;
      const alpha = 0.16 + pulse * 0.12 + glow * 0.72;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(145, 176, 255, ${alpha})`;

      if (useShadowBlur && glow > 0.5) {
        ctx.shadowBlur = 14 + glow * 24;
        ctx.shadowColor = "rgba(255, 209, 153, 1)";
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.shadowBlur = 0;
    }

    if (document.visibilityState !== "visible") return;

    const idle = time - lastMouseTime > IDLE_MS;
    if (idle) {
      timeoutId = setTimeout(() => draw(performance.now()), IDLE_FRAME_MS);
    } else {
      rafId = requestAnimationFrame(draw);
    }
  }

  function startLoop() {
    if (document.visibilityState !== "visible") return;
    rafId = requestAnimationFrame(draw);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = 0;
    } else {
      startLoop();
    }
  });

  resizeCanvas();
  startLoop();

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resizeCanvas, 120);
  });
}

if (canvas) {
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(initNeuronCanvas, { timeout: 2000 });
  } else {
    setTimeout(initNeuronCanvas, 1);
  }
}