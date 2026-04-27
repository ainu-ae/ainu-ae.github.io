const header = document.querySelector("[data-elevate]");
const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const canvas = document.querySelector("#signalCanvas");
const ctx = canvas.getContext("2d");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
let width = 0;
let height = 0;
let points = [];
let animationFrame = null;

function elevateHeader() {
  header.classList.toggle("is-elevated", window.scrollY > 12);
}

function closeNav() {
  navToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
}

navToggle.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!isOpen));
  siteNav.classList.toggle("is-open", !isOpen);
});

siteNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    closeNav();
  }
});

window.addEventListener("scroll", elevateHeader, { passive: true });
elevateHeader();

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = Math.min(95, Math.max(34, Math.floor((width * height) / 22000)));
  points = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    phase: index * 0.17
  }));
}

function drawNetwork(time = 0) {
  ctx.clearRect(0, 0, width, height);

  points.forEach((point) => {
    point.x += point.vx;
    point.y += point.vy;

    if (point.x < -20) point.x = width + 20;
    if (point.x > width + 20) point.x = -20;
    if (point.y < -20) point.y = height + 20;
    if (point.y > height + 20) point.y = -20;
  });

  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const first = points[i];
      const second = points[j];
      const distance = Math.hypot(first.x - second.x, first.y - second.y);

      if (distance < 150) {
        const opacity = (1 - distance / 150) * 0.22;
        ctx.strokeStyle = `rgba(40, 232, 255, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(first.x, first.y);
        ctx.lineTo(second.x, second.y);
        ctx.stroke();
      }
    }
  }

  points.forEach((point, index) => {
    const pulse = Math.sin(time * 0.0018 + point.phase) * 0.5 + 0.5;
    ctx.fillStyle = index % 5 === 0 ? `rgba(138, 92, 255, ${0.32 + pulse * 0.28})` : `rgba(40, 232, 255, ${0.28 + pulse * 0.26})`;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 1.8 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();
  });

  animationFrame = requestAnimationFrame(drawNetwork);
}

function startCanvas() {
  cancelAnimationFrame(animationFrame);
  resizeCanvas();

  if (!motionQuery.matches) {
    animationFrame = requestAnimationFrame(drawNetwork);
  } else {
    drawNetwork(1);
    cancelAnimationFrame(animationFrame);
  }
}

window.addEventListener("resize", resizeCanvas, { passive: true });
motionQuery.addEventListener("change", startCanvas);
startCanvas();
