const root = document.documentElement;
const machine = document.querySelector('.time-machine');
const scene = document.querySelector('.scene');
const car = document.querySelector('.car-position');
const chapters = [...document.querySelectorAll('.chapter')];
const routes = [...document.querySelectorAll('.route a')];
const motionButton = document.querySelector('.motion-toggle');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = document.querySelector('.sparks');
const ctx = canvas.getContext('2d');
const speedText = document.querySelector('#speed-value');
const year = document.querySelector('#destination-year');
const month = document.querySelector('#destination-month');
const day = document.querySelector('#destination-day');
const destination = document.querySelector('#destination-label');
let paused = reducedMotion.matches;
let frame = 0, speed = 0, targetSpeed = 0, lastScroll = scrollY;
let lastScrollTime = performance.now(), lastFrameTime = lastScrollTime;
let roadOffset = 0, spawnBudget = 0, previousStage = -1;
let sceneWidth = 0, sceneHeight = 0, carWidth = 0, carHeight = 0, baseX = 0, baseY = 0;
let particles = [];

const stored = key => { try { return localStorage.getItem(key); } catch { return null; } };
const persist = (key, value) => { try { localStorage.setItem(key, value); } catch { /* Storage is optional. */ } };
paused = reducedMotion.matches || stored('pv-motion') === 'paused';
const themeButton = document.querySelector('.theme-toggle');
function setTheme(theme) {
  root.dataset.theme = theme;
  themeButton.setAttribute('aria-pressed', String(theme === 'light'));
  document.querySelector('meta[name="theme-color"]').content = theme === 'light' ? '#f1eee4' : '#101817';
}
setTheme(stored('pv-theme') === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => {
  const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  setTheme(theme); persist('pv-theme', theme); requestRender();
});
document.querySelectorAll('[data-language]').forEach(link => {
  link.addEventListener('click', () => {
    const active = chapters[Math.max(0, previousStage)];
    link.hash = active?.id || 'inicio';
  });
});

function updateMotion() {
  root.classList.toggle('effects-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.querySelector('.motion-text').textContent = paused ? motionButton.dataset.resume : motionButton.dataset.pause;
  motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  if (paused) { particles = []; speed = 0; targetSpeed = 0; spawnBudget = 0; }
}
function resizeScene() {
  sceneWidth = scene.clientWidth; sceneHeight = scene.clientHeight;
  carWidth = car.offsetWidth; carHeight = car.offsetHeight;
  const style = getComputedStyle(car);
  baseX = parseFloat(style.left) - carWidth / 2; baseY = parseFloat(style.top);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(sceneWidth * dpr); canvas.height = Math.round(sceneHeight * dpr);
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = [];
  requestRender();
}
function spawnSpark(energy, x, y) {
  if (!ctx || particles.length >= 110) return;
  const side = Math.random() > .5 ? 1 : -1;
  const wheel = Math.random() > .5 ? .22 : .77;
  const lifetime = .2 + Math.random() * .45;
  particles.push({ x: x + carWidth * (.5 + side * .37), y: y + carHeight * wheel,
    vx: side * (12 + Math.random() * 70) * (.5 + energy), vy: -(50 + Math.random() * 170) * (.5 + energy),
    life: lifetime, max: lifetime, width: .6 + Math.random() * 1.2, blue: Math.random() < .25 });
}
function drawParticles(dt, energy, x, y) {
  if (!ctx) return;
  ctx.clearRect(0, 0, sceneWidth, sceneHeight);
  if (paused) return;
  if (energy > .06) {
    spawnBudget += dt * energy * 120;
    while (spawnBudget >= 1) { spawnSpark(energy, x, y); spawnBudget--; }
  }
  const light = root.dataset.theme === 'light';
  particles = particles.filter(p => p.life > 0);
  for (const p of particles) {
    p.life -= dt;
    const oldX = p.x, oldY = p.y;
    p.x += p.vx * dt; p.y += p.vy * dt;
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.strokeStyle = p.blue ? (light ? '#287389' : '#adf0ff') : (light ? '#a84c14' : '#ffd194');
    ctx.lineWidth = p.width;
    ctx.beginPath(); ctx.moveTo(oldX, oldY); ctx.lineTo(p.x + p.vx * .018, p.y + p.vy * .018); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function render(now) {
  frame = 0;
  const dt = Math.min(.05, Math.max(.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;
  if (now - lastScrollTime > 100) targetSpeed *= Math.exp(-dt * 6);
  // Time-based acceleration and coasting behave consistently across refresh rates.
  speed += ((paused ? 0 : targetSpeed) - speed) * (1 - Math.exp(-dt * 8));
  if (speed < .1) speed = 0;
  const energy = speed / 88;
  const progress = Math.max(0, Math.min(1, scrollY / Math.max(1, root.scrollHeight - innerHeight)));
  machine.style.setProperty('--energy', energy.toFixed(3));
  const compact = innerWidth <= 700;
  const sway = paused ? 0 : Math.sin(progress * Math.PI * 6) * (compact ? 2 : 9) + Math.sin(now / 105) * energy * 1.1;
  const advance = paused ? 0 : energy * (compact ? 5 : 32) + Math.sin(progress * Math.PI) * (compact ? 2 : 12);
  machine.style.setProperty('--car-x', `${sway.toFixed(2)}px`);
  machine.style.setProperty('--car-y', `${advance.toFixed(2)}px`);
  machine.style.setProperty('--car-angle', `${(paused ? 0 : Math.sin(progress * 12) * energy * 3).toFixed(2)}deg`);
  if (!paused) roadOffset = (roadOffset - dt * energy * 520) % 58;
  machine.style.setProperty('--road-offset', `${roadOffset.toFixed(2)}px`);
  machine.style.setProperty('--arc-offset', `${(-now * energy * .18).toFixed(1)}`);
  speedText.textContent = String(Math.round(speed)).padStart(2, '0');
  drawParticles(dt, energy, baseX + sway, baseY + advance);
  let stage = 0;
  chapters.forEach((chapter, i) => { if (chapter.getBoundingClientRect().top < innerHeight * (compact ? .45 : .48)) stage = i; });
  if (stage !== previousStage) {
    previousStage = stage;
    const data = chapters[stage].dataset;
    year.textContent = data.year; month.textContent = data.month; day.textContent = data.day; destination.textContent = data.label;
    machine.dataset.stage = stage;
    routes.forEach((link,i) => { if (i === stage) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  }
  if (!paused && !document.hidden && (speed > 0 || particles.length > 0)) requestRender();
}
function requestRender() { if (!frame && !document.hidden) frame = requestAnimationFrame(render); }
window.addEventListener('scroll', () => {
  const now = performance.now();
  const distance = Math.abs(scrollY - lastScroll);
  const elapsed = Math.max(16, now - lastScrollTime);
  if (distance > 0 && !paused) targetSpeed = Math.min(88, distance / elapsed * 48);
  lastScroll = scrollY; lastScrollTime = now; requestRender();
}, { passive: true });
motionButton.addEventListener('click', () => { paused = !paused; persist('pv-motion', paused ? 'paused' : 'enabled'); updateMotion(); requestRender(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotion(); requestRender(); });
window.addEventListener('resize', resizeScene, { passive: true });
new ResizeObserver(resizeScene).observe(scene);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; particles = []; speed = 0; targetSpeed = 0; }
  else { lastFrameTime = performance.now(); lastScrollTime = lastFrameTime; lastScroll = scrollY; requestRender(); }
});

const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(index, focus = false) {
  tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  });
  if (focus) tabs[index].focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(index));
  tab.addEventListener('keydown', event => {
    let next;
    if (['ArrowDown', 'ArrowRight'].includes(event.key)) next = (index + 1) % tabs.length;
    if (['ArrowUp', 'ArrowLeft'].includes(event.key)) next = (index + tabs.length - 1) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { event.preventDefault(); activateTab(next, true); }
  });
});
activateTab(0);

const form = document.querySelector('.contact-form');
const draftLink = form.querySelector('.draft-link');
form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = String(data.get('subject')).trim().replace(/[\r\n]/g, ' ');
  const body = `${String(data.get('message')).trim()}\n\n${String(data.get('email')).trim()}`;
  draftLink.href = `mailto:pvictors152004@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  draftLink.hidden = false;
  form.querySelector('.form-status').textContent = form.dataset.ready;
});
form.addEventListener('input', () => { draftLink.hidden = true; draftLink.removeAttribute('href'); form.querySelector('.form-status').textContent = ''; });
document.querySelector('#current-year').textContent = new Date().getFullYear();
updateMotion(); resizeScene(); requestRender();
