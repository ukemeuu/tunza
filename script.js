// =========================
// Helpers
// =========================
const $ = (s, scope = document) => scope.querySelector(s);

// =========================
// Mobile menu (now locks body scroll)
// =========================
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");
menuBtn?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
  // NEW: lock body scroll when open
  document.body.style.overflow = open ? "hidden" : "";
});

// Close mobile menu after in-page nav
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  if (!id || id === "#") return;
  const el = document.querySelector(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    mobileMenu?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = ""; // restore scroll
  }
});

// =========================
/* Contact form (Formspree AJAX) */
// =========================
const form = $("#contactForm");
const formNote = $("#formNote");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  // Basic validation
  if (!data.name || !data.email || !data.message) {
    formNote.textContent = "⚠️ Please fill in all fields.";
    formNote.style.color = "red";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    formNote.textContent = "⚠️ Please enter a valid email address.";
    formNote.style.color = "red";
    return;
  }

  try {
    const response = await fetch(form.action, {
      method: form.method,
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      formNote.textContent = "✅ Thanks! Your message has been sent.";
      formNote.style.color = "green";
      form.reset();
    } else {
      formNote.textContent = "❌ Oops! Something went wrong. Please try again.";
      formNote.style.color = "red";
    }
  } catch (err) {
    formNote.textContent = "❌ Network error. Please try again.";
    formNote.style.color = "red";
  }
});

// =========================
// Year
// =========================
$("#year").textContent = new Date().getFullYear();

// =========================
// Subtle fade-up on observe
// =========================
const io = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.animate(
          [
            { opacity: 0, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 550, easing: "ease-out" }
        );
        io.unobserve(entry.target);
      }
    }),
  { threshold: 0.15 }
);
document
  .querySelectorAll(".card, .headline, .section-title")
  .forEach((el) => io.observe(el));

document
  .querySelectorAll(
    ".card, .headline, .section-title, #distribution .dist-copy, #distribution .dist-ring"
  )
  .forEach((el) => io.observe(el));

// =========================
// “Save” heart (now persists to localStorage)
// =========================
(() => {
  const favButtons = Array.from(
    document.querySelectorAll(".listing-card .fav")
  );
  favButtons.forEach((btn, i) => {
    const key = `tunza:fav:${i}`;
    // restore state
    if (localStorage.getItem(key) === "1") btn.classList.add("active");
    // toggle + persist
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      btn.classList.toggle("active");
      localStorage.setItem(key, btn.classList.contains("active") ? "1" : "0");
    });
  });
})();

// =========================
// FAQ accordion (exclusive + close on outside/Esc)
// =========================
(() => {
  const faq = document.getElementById("faq");
  if (!faq) return;

  const items = Array.from(faq.querySelectorAll("details.card"));

  items.forEach((details) => {
    const summary = details.querySelector("summary");
    if (!summary) return;

    summary.setAttribute("role", "button");
    summary.setAttribute(
      "aria-expanded",
      details.hasAttribute("open") ? "true" : "false"
    );
    summary.style.cursor = "pointer";

    summary.addEventListener("click", (e) => {
      e.preventDefault(); // stop default <details> toggle
      const isOpen = details.hasAttribute("open");

      // close all
      items.forEach((d) => {
        d.removeAttribute("open");
        const s = d.querySelector("summary");
        if (s) s.setAttribute("aria-expanded", "false");
      });

      // reopen if it was closed
      if (!isOpen) {
        details.setAttribute("open", "");
        summary.setAttribute("aria-expanded", "true");
      }
    });

    // prevent clicks inside an open details from bubbling and closing
    details.addEventListener("click", (e) => e.stopPropagation());
  });

  // Click outside the FAQ closes all
  document.addEventListener("click", (e) => {
    if (!faq.contains(e.target)) {
      items.forEach((d) => {
        d.removeAttribute("open");
        const s = d.querySelector("summary");
        if (s) s.setAttribute("aria-expanded", "false");
      });
    }
  });

  // Esc key closes all
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      items.forEach((d) => {
        d.removeAttribute("open");
        const s = d.querySelector("summary");
        if (s) s.setAttribute("aria-expanded", "false");
      });
    }
  });
})();

// =========================
// Before/After slider (now supports drag + touch)
// =========================
(() => {
  const wrap = document.querySelector(".makeover-compare");
  if (!wrap) return;

  const range = wrap.querySelector(".mk-range");
  const after = wrap.querySelector(".mk-after");
  const handle = wrap.querySelector(".mk-handle");

  const update = (v) => {
    // v: 0..100 – reveal AFTER image from left to right
    const pct = Math.max(0, Math.min(100, Number(v)));
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = `${pct}%`;
  };

  const setFromPointer = (clientX) => {
    const rect = wrap.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    range.value = String(Math.max(0, Math.min(100, pct)));
    update(range.value);
  };

  let dragging = false;

  // Pointer events (mouse + touch via Pointer Events)
  wrap.addEventListener("pointerdown", (e) => {
    dragging = true;
    wrap.setPointerCapture?.(e.pointerId);
    setFromPointer(e.clientX);
  });
  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    setFromPointer(e.clientX);
  });
  window.addEventListener("pointerup", () => {
    dragging = false;
  });

  // Keep native range input in sync too
  range.addEventListener("input", (e) => update(e.target.value));

  // initial
  update(range.value || 50);
})();

// =========================
// (Optional) Mark non-critical images as lazy
// =========================
(() => {
  const lazyCandidates = document.querySelectorAll(
    "img:not(.logo-img):not([loading])"
  );
  lazyCandidates.forEach((img) => {
    img.loading = "lazy";
    img.decoding = "async";
  });
})();

/* =========================
   Scroll Animations (Reveal + Stagger)
========================= */
(() => {
  const els = Array.from(document.querySelectorAll("[data-animate]"));

  // Prepare elements
  els.forEach((el) => {
    el.classList.add("will-animate");
    const delay = el.getAttribute("data-delay");
    const dur = el.getAttribute("data-duration");
    const dist = el.getAttribute("data-distance");
    if (delay) el.style.setProperty("--delay", `${parseInt(delay, 10)}ms`);
    if (dur) el.style.setProperty("--dur", `${parseInt(dur, 10)}ms`);
    if (dist) el.style.setProperty("--distance", dist); // e.g. "24px"
  });

  // Stagger: index children inside any [data-stagger]
  document.querySelectorAll("[data-stagger]").forEach((wrap) => {
    Array.from(wrap.children).forEach((child, i) => {
      child.style.setProperty("--i", i);
      // If a child is meant to animate but lacks class, ensure it animates
      if (child.matches("[data-animate]")) child.classList.add("will-animate");
    });
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const repeat = el.getAttribute("data-repeat") === "true";
        if (entry.isIntersecting) {
          el.classList.add("is-inview");
          if (!repeat) io.unobserve(el);
        } else if (repeat) {
          el.classList.remove("is-inview");
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
  );

  els.forEach((el) => io.observe(el));
})();

/* =========================
   Scroll Progress + Active Nav + Parallax
========================= */
(() => {
  // Progress bar
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);

  // Section tracking for active nav
  const sections = Array.from(document.querySelectorAll("section[id]")).map(
    (el) => ({ id: el.id, el })
  );
  const navLinks = Array.from(
    document.querySelectorAll(
      '.primary-nav a[href^="#"], #mobileMenu a[href^="#"]'
    )
  );
  const setActive = (id) =>
    navLinks.forEach((a) =>
      a.classList.toggle("active", a.getAttribute("href") === `#${id}`)
    );
  let activeId = "";

  // Parallax elements (set data-parallax="0.15" etc.)
  const parallaxEls = Array.from(
    document.querySelectorAll("[data-parallax]")
  ).map((el) => ({
    el,
    factor: parseFloat(el.getAttribute("data-parallax")) || 0.15,
  }));

  const tick = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max ? (h.scrollTop / max) * 100 : 0;
    bar.style.width = `${pct}%`;

    // Active section
    let current = activeId;
    for (const s of sections) {
      const r = s.el.getBoundingClientRect();
      if (r.top <= 120 && r.bottom >= 120) {
        current = s.id;
        break;
      }
    }
    if (current !== activeId) {
      activeId = current;
      if (activeId) setActive(activeId);
    }

    // Parallax
    parallaxEls.forEach(({ el, factor }) => {
      const r = el.getBoundingClientRect();
      const offset =
        (window.innerHeight * 0.5 - (r.top + r.height / 2)) * factor;
      el.style.setProperty("--py", `${offset.toFixed(1)}px`);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        tick();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  tick(); // initial
})();

/* =========================
   Lead Magnet: capture email + trigger download
========================= */
(() => {
  const form = document.getElementById("leadForm");
  if (!form) return;

  const email = document.getElementById("leadEmail");
  const note = document.getElementById("leadNote");
  const link = document.getElementById("leadDownloadLink");
  const pdfUrl = link?.getAttribute("href") || "docs/tunza-host-guide.pdf";

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const value = (email.value || "").trim();

    if (!isValidEmail(value)) {
      note.textContent = "⚠️ Please enter a valid email address.";
      return;
    }

    note.textContent = "Sending…";

    try {
      const res = await fetch(form.action, {
        method: form.method,
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error("Submit failed");

      note.textContent = "✅ Opening your guide…";
      // Trigger download
      if (link) {
        link.hidden = false;
        link.click();
      } else {
        const a = document.createElement("a");
        a.href = pdfUrl;
        a.download = "";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      form.reset();
    } catch (err) {
      note.textContent = "❌ Could not submit. You can still download below.";
      if (link) link.hidden = false;
    }
  });
})();
