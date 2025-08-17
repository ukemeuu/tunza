// Helpers
const $ = (s, scope = document) => scope.querySelector(s);

// Mobile menu
const menuBtn = $("#menuBtn");
const mobileMenu = $("#mobileMenu");
menuBtn?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

// Smooth-scroll fix for sticky header offset (enhanced)
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href");
  if (!id || id === "#") return;
  const el = document.querySelector(id);
  if (el) {
    e.preventDefault();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    mobileMenu.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
  }
});

// Contact form (frontend validation only)
const form = $("#contactForm");
const formNote = $("#formNote");
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (!data.name || !data.email || !data.message) {
    formNote.textContent = "Please fill in all fields.";
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    formNote.textContent = "Please enter a valid email address.";
    return;
  }
  formNote.textContent = "Thanks! Your message has been sent.";
  form.reset();
});

// Year
$("#year").textContent = new Date().getFullYear();

// Subtle fade-up on observe
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
// toggle “save” heart
document.querySelectorAll(".listing-card .fav").forEach((btn) => {
  btn.addEventListener("click", () => btn.classList.toggle("active"));
});
