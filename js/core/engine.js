/* =========================================================
   기본 도구
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const shell = $('#shell'), stage = $('#stage');
const D = { box: $('#dialog'), who: $('#speaker'), line: $('#line'), next: $('#next'), choices: $('#choices') };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 소리 (Web Audio로 직접 만든 8비트 효과음) ---------- */
const sfx = (() => {
  let ctx = null, on = true;
  const btn = $('#sound');
  btn.addEventListener('click', e => { e.stopPropagation(); on = !on; btn.setAttribute('aria-pressed', on); if (on) beep(660, .06); });
  function ensure() { try { if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (_) {} }
  function beep(f, d = .05, type = 'square', vol = .05, slide = 0) {
    if (!on || !ctx) return;
    try {
      const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = type; o.frequency.setValueAtTime(f, t);
      if (slide) o.frequency.linearRampToValueAtTime(f + slide, t + d);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + d + .02);
    } catch (_) {}
  }
  const seq = (notes, gap = 90) => notes.forEach((f, i) => setTimeout(() => beep(f, .09), i * gap));
  return {
    ensure,
    blip: () => beep(520 + Math.random() * 60, .025, 'square', .025),
    select: () => beep(880, .05),
    confirm: () => seq([660, 990]),
    item: () => seq([523, 659, 784, 1047], 70),
    bad: () => beep(140, .25, 'sawtooth', .04, -60),
    step: () => beep(220, .03, 'triangle', .05),
    save: () => seq([523, 784, 659, 1047], 110),
    hit: () => beep(1175, .05, 'square', .04),
  };
})();

/* ---------- HUD ---------- */
const CHAPTERS = ['세이브 불러오기', '파티 확인', '함께 있던 맵', '원거리 모드', '퀘스트 로그', '마지막 선택', '엔딩'];
$('#pips').innerHTML = CHAPTERS.map(() => '<i></i>').join('');
function chapter(i, label) {
  $('#chapter').innerHTML = `<b>CH.${i + 1}</b>${label || CHAPTERS[i]}`;
  [...$('#pips').children].forEach((p, n) => p.classList.toggle('on', n <= i));
}

/* ---------- 탭으로 진행 ---------- */
let waiter = null, skipTyping = null;
let tapTarget = shell;
shell.addEventListener('click', e => {
  sfx.ensure();
  if (!tapTarget.contains(e.target)) return;
  if (e.target.closest('button, .char')) return;   // 버튼·캐릭터 탭은 대화 진행 안 함
  if (skipTyping) { skipTyping(); return; }
  if (waiter) { const r = waiter; waiter = null; r(); }
});
D.box.addEventListener('keydown', e => {
  if (e.target !== D.box || e.repeat || !['Enter', ' '].includes(e.key)) return;
  e.preventDefault();
  D.box.click();
});
const waitTap = () => new Promise(r => { waiter = r; });
async function withDialogInput(run) {
  const previousTarget = tapTarget, previousTabIndex = D.box.getAttribute('tabindex');
  tapTarget = D.box; D.box.tabIndex = 0;
  try { return await run(); }
  finally {
    tapTarget = previousTarget;
    if (previousTabIndex === null) D.box.removeAttribute('tabindex');
    else D.box.setAttribute('tabindex', previousTabIndex);
  }
}

/* ---------- 대화창 ---------- */
const NAMES = { sys: '시스템', jjun: '쭌', wawa: '와와' };
function typeText(text) {
  return new Promise(res => {
    const chars = [...text]; let i = 0, timer;
    D.line.textContent = '';
    const done = () => { clearTimeout(timer); D.line.textContent = text; skipTyping = null; res(); };
    skipTyping = done;
    if (reduce) return done();
    (function step() {
      if (i >= chars.length) return done();
      D.line.textContent += chars[i];
      if (chars[i].trim() && i % 2 === 0) sfx.blip();
      i++; timer = setTimeout(step, 32);
    })();
  });
}
function speaker(who) {
  D.box.hidden = false;
  D.who.textContent = NAMES[who] || '';
  D.who.className = who;
}
async function say(who, text) {
  speaker(who); D.choices.innerHTML = ''; D.next.hidden = true;
  if (tapTarget === D.box) D.box.focus({ preventScroll: true });
  stage.classList.add('busy');          // 대사 중에는 무대 위 버튼 잠금 → 어디를 탭해도 대사 진행
  await typeText(text);
  D.next.hidden = false;
  await waitTap();
  D.next.hidden = true;
  stage.classList.remove('busy');
}
const sys = t => say('sys', t);
async function hint(text) {           // 안내만 띄우고 기다리지 않음
  speaker('sys'); D.choices.innerHTML = ''; D.next.hidden = true;
  await typeText(text);
}
function hideDialog() { D.box.hidden = true; D.line.textContent = ''; D.choices.innerHTML = ''; }
function choice(options, { duo = false } = {}) {
  return new Promise(res => {
    D.next.hidden = true; D.choices.className = duo ? 'duo' : '';
    D.choices.innerHTML = '';
    options.forEach((label, i) => {
      const b = document.createElement('button');
      b.className = 'btn'; b.textContent = label;
      b.addEventListener('click', () => { sfx.select(); b.classList.add('pick'); setTimeout(() => { D.choices.innerHTML = ''; res(i); }, 180); });
      D.choices.appendChild(b);
    });
  });
}

/* ---------- 토스트 / 모달 ---------- */
let toastTimer;
function toast(text, ms = 2200) {
  const t = $('#toast'); t.textContent = text; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
// 확인 창: 열리면 뒤 화면을 잠그고 안전한 쪽(no)에 포커스, Esc는 no, 닫으면 연 버튼으로 포커스 복귀
function confirmBox(text, yes, no) {
  return new Promise(res => {
    const m = $('#modal'), row = $('#mrow'), opener = document.activeElement;
    const behind = [stage, D.box, $('#hud')];
    m.setAttribute('role', 'alertdialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-labelledby', 'mtext');
    $('#mtext').textContent = text; row.innerHTML = '';
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(false); } };
    const close = val => {
      sfx.select(); m.hidden = true; m.removeEventListener('keydown', onKey);
      behind.forEach(el => { el.inert = false; });
      if (opener && opener.isConnected) opener.focus({ preventScroll: true });
      res(val);
    };
    [[yes, true], [no, false]].forEach(([label, val]) => {
      const b = document.createElement('button'); b.className = 'btn'; b.textContent = label;
      b.addEventListener('click', () => close(val));
      row.appendChild(b);
    });
    behind.forEach(el => { el.inert = true; });
    m.hidden = false; m.addEventListener('keydown', onKey);
    row.lastChild.focus();
  });
}

/* ---------- 장면 전환 ---------- */
async function iris(close) {
  $('#iris').classList.toggle('closed', close);
  await sleep(reduce ? 10 : 600);
}
async function scene(chapterIdx, build, label) {
  await iris(true);
  hideDialog(); stage.innerHTML = '';
  const layer = document.createElement('div'); layer.className = 'layer';
  stage.appendChild(layer);
  build(layer);
  if (chapterIdx != null) chapter(chapterIdx, label);
  await iris(false);
  return layer;
}

/* ---------- 캐릭터 ---------- */
function makeChar(who, x, y, parent) {
  const el = document.createElement('div');
  el.className = `char char-${who}`; el.dataset.who = who;
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', who === 'jjun' ? '쭌: 메타몽으로 변신하기' : '와와: 세 번 눌러 덤벨 웃음 보기');
  el.style.left = x + '%'; el.style.top = y + '%';
  el.innerHTML =
    `<div class="flame">${svg('flame')}</div><div class="bang">!</div>` +
    `<div class="bell l">${svg('bell')}</div><div class="bell r">${svg('bell')}</div>` +
    `<div class="body">${svg(who)}</div><span class="tag">${NAMES[who]}</span>`;
  parent.appendChild(el);
  return el;
}
function setFace(el, name) {
  el.faceVersion = (el.faceVersion || 0) + 1;
  $('.body', el).innerHTML = svg(name);
}
async function walk(el, x, y, ms = 900) {
  const fromX = parseFloat(el.style.left);
  el.classList.toggle('flip', x < fromX);
  el.classList.add('walk');
  el.style.transition = reduce ? 'none' : `left ${ms}ms linear, top ${ms}ms linear`;
  el.style.left = x + '%'; el.style.top = y + '%';
  const steps = setInterval(sfx.step, 220);
  await sleep(reduce ? 20 : ms);
  clearInterval(steps); el.classList.remove('walk', 'flip'); el.style.transition = '';
}
async function alert(el) { el.classList.add('alert'); await sleep(700); el.classList.remove('alert'); }

/* ---------- 이스터에그: 쭌 변신 / 와와 연타 ---------- */
const taps = new WeakMap(), eggBusy = new WeakSet();
let dittoImage;
function loadDitto() {
  if (!dittoImage) {
    const image = new Image();
    image.className = 'ditto-image'; image.alt = '메타몽으로 변신한 쭌';
    image.width = 1536; image.height = 1024;
    image.src = 'assets/images/ditto.png';
    dittoImage = image.decode().then(() => image).catch(error => { dittoImage = null; throw error; });
  }
  return dittoImage;
}
shell.addEventListener('keydown', e => {
  const c = e.target.closest('.char');
  if (!c || e.repeat || !['Enter', ' '].includes(e.key)) return;
  e.preventDefault(); c.click();
});
shell.addEventListener('click', e => {
  const c = e.target.closest('.char');
  if (!c || eggBusy.has(c) || c.classList.contains('walk') || document.querySelector('dialog[open]') || !$('#modal').hidden) return;
  const who = c.dataset.who, now = Date.now();
  const recent = (taps.get(c) || []).filter(t => now - t < 1600).concat(now);
  taps.set(c, recent);
  sfx.blip();
  if (who === 'wawa' && recent.length >= 3) { taps.delete(c); dumbbell(c); }
  if (who === 'jjun') { taps.delete(c); morph(c); }
});
async function dumbbell(c) {
  eggBusy.add(c); setFace(c, 'wawaSmile'); c.classList.add('buff'); sfx.item();
  const version = c.faceVersion;
  toast('덤벨 든 아저씨 모드 발동');
  await sleep(2600); c.classList.remove('buff');
  if (c.isConnected && c.faceVersion === version && !c.dataset.keepSmile) setFace(c, 'wawa');
  eggBusy.delete(c);
}
async function morph(c) {
  eggBusy.add(c);
  const version = c.faceVersion;
  const body = $('.body', c);
  let image, original;
  try {
    image = (await loadDitto()).cloneNode();
    if (!c.isConnected || c.faceVersion !== version) return;
    original = [...body.childNodes];
    c.classList.add('morph-out');
    await sleep(reduce ? 0 : 160);
    if (!c.isConnected || c.faceVersion !== version) return;
    body.replaceChildren(image);
    c.classList.replace('morph-out', 'morph-in');
    c.classList.add('is-ditto'); sfx.item();
    toast(T.morph.success);
    await sleep(reduce ? 0 : 260);
    c.classList.remove('morph-in');
    await sleep(2000);
    if (!c.isConnected || !body.contains(image)) return;
    c.classList.add('morph-out');
    await sleep(reduce ? 0 : 160);
    if (!c.isConnected || !body.contains(image)) return;
    body.replaceChildren(...original);
    c.classList.remove('is-ditto');
    c.classList.replace('morph-out', 'morph-in'); sfx.confirm();
    await sleep(reduce ? 0 : 260);
  } catch (_) {
    if (c.isConnected) toast(T.morph.error);
  } finally {
    if (original && body.contains(image)) body.replaceChildren(...original);
    c.classList.remove('morph-out', 'morph-in', 'is-ditto');
    eggBusy.delete(c);
  }
}

