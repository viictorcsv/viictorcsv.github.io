const root = document.documentElement;
const machine = document.querySelector('.time-machine');
const chapters = [...document.querySelectorAll('.chapter')];
const routeLinks = [...document.querySelectorAll('.route a')];
const motionButton = document.querySelector('.motion-toggle');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = reducedMotion.matches;
let frame = 0;
let lastY = window.scrollY;
let lastTime = performance.now();
let speed = 0;
let previousStage = -1;

function updateMotionButton() {
  root.classList.toggle('effects-paused', paused);
  motionButton.setAttribute('aria-pressed', String(paused));
  motionButton.querySelector('.motion-text').textContent = paused ? 'ATIVAR EFEITOS' : 'PAUSAR EFEITOS';
  motionButton.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
}

function render(now) {
  frame = 0;
  const y = window.scrollY;
  const elapsed = Math.max(now - lastTime, 16);
  const targetSpeed = Math.min(88, Math.abs(y - lastY) / elapsed * 38);
  speed += (targetSpeed - speed) * .13;
  if (speed < .15) speed = 0;
  lastY = y;
  lastTime = now;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = Math.min(1, Math.max(0, y / max));
  root.style.setProperty('--progress', progress.toFixed(4));
  root.style.setProperty('--energy', paused ? '0' : (speed / 88).toFixed(3));
  if (!paused) {
    machine.style.setProperty('--car-x', `${Math.sin(progress * Math.PI * 3) * 12}px`);
    machine.style.setProperty('--car-y', `${Math.sin(progress * Math.PI * 5) * 24 - speed * .13}px`);
    machine.style.setProperty('--car-rotation', `${-4 + Math.sin(progress * Math.PI * 4) * 5}deg`);
  }
  document.querySelector('#speed-value').textContent = String(paused ? 0 : Math.round(speed)).padStart(2, '0');
  let stage = 0;
  chapters.forEach((chapter, index) => {
    if (chapter.getBoundingClientRect().top < innerHeight * .48) stage = index;
  });
  if (stage !== previousStage) {
    previousStage = stage;
    machine.dataset.stage = stage;
    const chapter = chapters[stage];
    document.querySelector('#destination-year').textContent = chapter.dataset.year;
    document.querySelector('#destination-label').textContent = chapter.dataset.label;
    document.querySelector('#destination-month').textContent = stage === 1 ? 'OUT' : stage === 2 ? 'AGO' : 'OUT';
    document.querySelector('#destination-day').textContent = stage === 1 ? '21' : stage === 2 ? '01' : '26';
    routeLinks.forEach((link, index) => {
      link.classList.toggle('active', index === stage);
      if (index === stage) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  if (speed > 0 && !paused && !document.hidden) requestRender();
}
function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
motionButton.addEventListener('click', () => { paused = !paused; speed = 0; updateMotionButton(); requestRender(); });
reducedMotion.addEventListener('change', event => { paused = event.matches; updateMotionButton(); requestRender(); });
window.addEventListener('scroll', requestRender, { passive: true });
window.addEventListener('resize', requestRender, { passive: true });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { cancelAnimationFrame(frame); frame = 0; speed = 0; }
  else { lastTime = performance.now(); lastY = window.scrollY; requestRender(); }
});
document.querySelector('#current-year').textContent = new Date().getFullYear();
updateMotionButton();
requestRender();
