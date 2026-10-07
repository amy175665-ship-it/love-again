/* =========================================================
   SCENES
   ========================================================= */

// 정적 페이지의 간단한 입장 잠금입니다. 서버 인증을 대신하지 않습니다.
async function sUnlock() {
  const A = T.access;
  const L = document.createElement('div'); L.className = 'layer sky access-screen';
  L.innerHTML = `<form class="panel access-form" novalidate>
    <div class="access-logo" aria-hidden="true">${svg('jjun')}${svg('wawa')}</div>
    <h1>${A.title}</h1>
    <label for="access-code">${A.label}</label>
    <input id="access-code" type="password" inputmode="numeric" pattern="[0-9]{4}" minlength="4" maxlength="4" autocomplete="off" required aria-describedby="access-hint access-error">
    <p id="access-hint">${A.hint}</p>
    <p id="access-error" role="alert"></p>
    <button class="btn" type="submit">${A.submit}</button>
  </form>`;
  stage.replaceChildren(L);
  const hud = $('#hud'), form = $('form', L), input = $('input', L), error = $('#access-error', L);
  hud.inert = true;
  L.addEventListener('click', e => e.stopPropagation());
  input.addEventListener('input', () => {
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 4);
    input.removeAttribute('aria-invalid'); error.textContent = '';
  });
  input.focus({ preventScroll: true });
  await new Promise(resolve => form.addEventListener('submit', e => {
    e.preventDefault();
    const value = input.value;
    if (!/^[0-9]{4}$/.test(value) || value !== A.code) {
      error.textContent = /^[0-9]{4}$/.test(value) ? A.wrongError : A.formatError;
      input.setAttribute('aria-invalid', 'true'); input.focus(); input.select();
      return;
    }
    $('button', form).disabled = true; input.value = '';
    resolve();
  }));
  L.remove(); hud.inert = false;
}

// 0. 부팅
async function sBoot() {
  const L = document.createElement('div'); L.className = 'layer sky center'; stage.appendChild(L);
  L.innerHTML = `
    <div class="boot-logo">${svg('jjun')}${svg('wawa')}</div>
    <div class="press blink">TAP TO START</div>
    <p class="small">소리가 나와요. 오른쪽 위에서 끌 수 있어요.</p>`;
  L.tabIndex = 0; L.setAttribute('role', 'button'); L.setAttribute('aria-label', '게임 시작');
  L.addEventListener('keydown', e => {
    if (!e.repeat && ['Enter', ' '].includes(e.key)) { e.preventDefault(); L.click(); }
  });
  L.focus({ preventScroll: true });
  await waitTap();
  sfx.confirm();
  shell.classList.remove('boot');
}

// 1. 타이틀 + 세이브 불러오기
async function sTitle() {
  let card;
  const L = await scene(0, L => {
    L.className = 'layer sky center';
    L.innerHTML = `
      <h1 class="title">CONTINUE<span class="q">?</span></h1>
      <div class="subtitle">SAVE FILE 01</div>
      <button class="save" id="slot" aria-label="세이브 파일 불러오기">
        <h3><span>FILE 01</span><span class="faces">${svg('jjun')}${svg('wawa')}</span></h3>
        <dl>
          <dt>플레이어</dt><dd>쭌 &amp; 와와</dd>
          <dt>플레이 시간</dt><dd id="pt">--:--</dd>
          <dt>추억 기록</dt><dd id="pl">-</dd>
          <dt>진행 중 퀘스트</dt><dd id="qs">-</dd>
          <dt>마지막 저장 위치</dt><dd id="last">???</dd>
        </dl>
        <div class="bar"><i id="load"></i></div>
      </button>
      <p class="small blink" id="tapme">세이브 파일을 탭해서 불러오기</p>`;
  });
  card = $('#slot', L);
  await new Promise(r => card.addEventListener('click', r, { once: true }));
  sfx.select(); $('#tapme', L).remove();
  $('#load', L).style.width = '100%';
  const t0 = performance.now(), dur = reduce ? 1 : 1800;
  await new Promise(done => {
    (function tick(now) {
      const k = Math.min(1, (now - t0) / dur);
      $('#pt', L).textContent = Math.floor(T.playTime * k).toLocaleString('en-US') + ':00';
      $('#pl', L).textContent = Math.ceil((T.memories.length + 4) * k) + '개';
      $('#qs', L).textContent = Math.ceil(T.pending.length * k) + '개';
      if (k % .1 < .02) sfx.blip();
      k < 1 ? requestAnimationFrame(tick) : done();
    })(t0);
  });
  card.classList.add('loaded'); card.style.pointerEvents = 'none'; sfx.confirm();
  await sys('세이브 파일을 불러왔습니다.');
  await sys('플레이 시간 43,800시간. 두 명의 기록이 남아 있습니다.');
}

// 추억 장면: label에 날짜와 장소를 표시합니다. 날짜가 없는 기록은 '날짜 미상'으로 둡니다.
async function memoryStage(memory, chapterIdx = 2) {
  const L = await scene(chapterIdx, L => {
    L.className = `layer memory-scene memory-${memory.theme}`;
    L.innerHTML = `<div class="memory-heading"><p>${memory.label}</p><h2>${memory.title}</h2></div>
      <div class="memory-picture" aria-hidden="true">${svg(memory.icon)}</div>
      <div class="memory-duo"></div>
      <div class="memory-ground"><div class="memory-rewards" aria-live="polite"></div></div>`;
  }, memory.title);
  makeChar('jjun', 30, 82, $('.memory-duo', L));
  makeChar('wawa', 70, 82, $('.memory-duo', L));
  return L;
}
async function sBeginning() {
  await withDialogInput(async () => {
    await memoryStage(T.beginning, 1);
    for (const [who, line] of T.beginning.lines) await say(who, line);
  });
}

// 2. 파티 확인
function traitRows(rows) {
  return rows.map(([k, v]) => `<p><b>${k}</b>${v}</p>`).join('');
}
function showTraits(who, opener) {
  const modal = document.createElement('dialog');
  modal.className = 'trait-dialog panel';
  modal.setAttribute('aria-labelledby', 'trait-title');
  modal.innerHTML = `<h2 id="trait-title">${NAMES[who]}의 특성 카드</h2>
    ${traitRows(who === 'jjun' ? T.jjunCard : T.wawaCard)}
    <button class="btn" autofocus>맵으로 돌아가기</button>`;
  modal.addEventListener('click', e => e.stopPropagation());
  $('button', modal).addEventListener('click', () => { sfx.select(); modal.close(); });
  modal.addEventListener('close', () => { modal.remove(); opener.focus(); }, { once: true });
  shell.appendChild(modal);
  sfx.select();
  modal.showModal();
}
async function sParty() {
  const L = await scene(1, L => {
    const card = (who, pl, rows) => `
      <button class="card" data-who="${who}" aria-label="${NAMES[who]} 정보 보기">
        <div class="in">
          <div class="face front">
            <div class="pl">${pl}</div>
            <div class="spr">${svg(who)}</div>
            <div class="nm">${NAMES[who]}</div>
            <div class="hint blink">탭해서 정보 보기</div>
          </div>
          <div class="face back">
            <div class="nm">${NAMES[who]}</div>
            ${traitRows(rows)}
          </div>
        </div>
      </button>`;
    L.className = 'layer sky';
    L.innerHTML = `<div class="cards">${card('jjun', 'PLAYER 1', T.jjunCard)}${card('wawa', 'PLAYER 2', T.wawaCard)}</div>`;
  });
  tapTarget = D.box;
  D.box.tabIndex = 0;
  const instruction = hint('파티 정보를 확인하세요. 카드를 탭하면 뒤집혀요.');
  const seen = new Set();
  await new Promise(done => {
    L.querySelectorAll('.card').forEach(c => c.addEventListener('click', () => {
      c.classList.toggle('flipped'); sfx.select(); seen.add(c.dataset.who);
      if (seen.size === 2) done();
    }));
  });
  await instruction;
  D.next.hidden = false;
  await waitTap();
  D.next.hidden = true;
  await sys('PLAYER 1 쭌, PLAYER 2 와와. 두 명이 한 파티입니다.');
  await say('wawa', '쭌, 오랜만에 우리 세이브 파일 열어보자.');
  await sys('팁: 캐릭터를 여러 번 탭하면 가끔 무슨 일이 일어납니다.');
  tapTarget = shell;
  D.box.removeAttribute('tabindex');
}

// 3. 함께 있던 맵
const SPOTS = [
  { id: 'pc',   name: '제로백 PC방', x: 26, y: 70, icon: 'monitor', run: evPC },
  { id: 'food', name: '맛집 골목',   x: 72, y: 50, icon: 'burger',  run: evFood },
  { id: 'game', name: '게임 룸',     x: 30, y: 24, icon: 'dice',    run: evGame },
];
async function sMap() {
  const done = new Set();
  let pos = { x: 50, y: 91 };
  while (done.size < SPOTS.length) {
    const L = await scene(2, L => {
      L.className = 'layer map';
      L.innerHTML = `
        <div class="map-party" role="group" aria-label="각자의 특성 카드 다시 보기">
          <button class="btn" data-traits="jjun" aria-haspopup="dialog">쭌 특성</button>
          <button class="btn" data-traits="wawa" aria-haspopup="dialog">와와 특성</button>
        </div>
        <svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50 96 L26 70 L72 50 L30 24" fill="none" stroke="#ffffff" stroke-opacity=".95" stroke-dasharray="10 9" vector-effect="non-scaling-stroke" style="stroke-width:7px;stroke-linecap:round"/>
        </svg>
        ${SPOTS.map(s => `
          <button class="node ${done.has(s.id) ? 'done' : 'pulse'}" data-id="${s.id}" style="left:${s.x}%;top:${s.y}%" ${done.has(s.id) ? 'disabled' : ''}>
            <span class="ico">${svg(s.icon)}</span><span class="lb">${s.name}</span>
          </button>`).join('')}`;
    });
    const jj = makeChar('jjun', pos.x - 6, pos.y, L);
    const ww = makeChar('wawa', pos.x + 6, pos.y, L);
    L.querySelectorAll('[data-traits]').forEach(b =>
      b.addEventListener('click', () => showTraits(b.dataset.traits, b)));
  hint(done.size === 0 ? T.daily.intro : `남은 장소 ${SPOTS.length - done.size}곳. 장소를 탭하세요.`);
    const spot = await new Promise(r => L.querySelectorAll('.node:not([disabled])').forEach(n =>
      n.addEventListener('click', () => { sfx.select(); r(SPOTS.find(s => s.id === n.dataset.id)); })));
    L.querySelectorAll('.node').forEach(n => n.disabled = true);
    L.querySelectorAll('[data-traits]').forEach(b => b.disabled = true);
    hideDialog();
    await Promise.all([walk(jj, spot.x - 6, spot.y + 9), walk(ww, spot.x + 6, spot.y + 9)]);
    pos = { x: spot.x, y: spot.y + 9 };
    await spot.run();
    done.add(spot.id);
  }
  await sys('함께 있던 맵을 전부 돌아봤습니다.');
  await sys(T.daily.complete);
}

// 3-1. 제로백 PC방
async function evPC() {
  const L = await scene(2, L => {
    L.className = 'layer pcroom';
    L.innerHTML = `
      <div class="sign">제로백 PC방</div>
      <div class="mon" style="left:calc(28% - 42px)"><div class="glow"></div>${svg('monitor')}</div>
      <div class="mon" style="left:calc(72% - 42px)"><div class="glow"></div>${svg('monitor')}</div>
      <div class="desk"></div>`;
  }, '제로백 PC방');
  const jj = makeChar('jjun', 28, 96, L), ww = makeChar('wawa', 72, 96, L);
  await withDialogInput(async () => {
    for (const [who, line] of T.daily.pc) await say(who, line);
  });
  sfx.item(); toast('제로백 출석 도장 +1');
  await sleep(600);
}

// 3-2. 맛집 골목
async function evFood() {
  const keys = Object.keys(T.food);
  const L = await scene(2, L => {
    L.className = 'layer street ev';
    L.innerHTML = `
      <div class="hpbox">
        <div class="hp low" id="hpj">쭌 HP<div class="bar"><i style="width:25%"></i></div></div>
        <div class="hp low" id="hpw">와와 HP<div class="bar"><i style="width:25%"></i></div></div>
      </div>
      <div class="counter">${keys.map(k => `
        <button class="item" data-k="${k}"><span class="spr">${svg(k === 'gop' ? 'gop' : k)}</span>${T.food[k][0]}</button>`).join('')}
      </div>`;
  }, '맛집 골목');
  const jj = makeChar('jjun', 36, 44, L), ww = makeChar('wawa', 64, 44, L);
  let hp = 25;
  const used = new Set();
  while (used.size < keys.length) {
    hint(used.size ? '남은 아이템을 탭하세요.' : '맛집 골목입니다. 둘 다 배가 고파요. 아이템을 탭해서 사용하세요.');
    const k = await new Promise(r => L.querySelectorAll('.item:not(.used)').forEach(b =>
      b.onclick = () => r(b.dataset.k)));
    L.querySelectorAll('.item').forEach(b => b.onclick = null);
    $(`.item[data-k="${k}"]`, L).classList.add('used'); used.add(k);
    sfx.item(); hp += 25;
    L.querySelectorAll('.hp').forEach(h => { $('i', h).style.width = hp + '%'; h.classList.toggle('low', hp < 50); });
    await say('sys', `${T.food[k][0]}을(를) 사용했습니다. ${T.food[k][1]}`);
  }
  setFace(ww, 'wawaSmile');
  await sys('HP가 가득 찼습니다. 같이 먹으면 회복량이 두 배입니다.');
  setFace(ww, 'wawa');
}

// 3-3. 게임 룸 (리듬 + 주사위)
async function evGame() {
  let L = await scene(2, L => {
    L.className = 'layer rhythm';
    L.innerHTML = `
      <div class="combo" id="combo">COMBO 0</div>
      <div class="lanes">
        <button class="lane" data-l="0" aria-label="왼쪽 레인"><div class="hit"></div><div class="who">쭌</div></button>
        <button class="lane" data-l="1" aria-label="오른쪽 레인"><div class="hit"></div><div class="who">와와</div></button>
      </div>
      <div class="judge" id="judge"></div>`;
  }, '게임 룸 — 리듬게임');
  await sys('게임 룸입니다. 먼저 리듬게임 한 판.');
  await sys('노트가 선에 닿을 때 그 줄을 탭하세요. 틀려도 괜찮아요.');
  hideDialog();
  await rhythm(L);
  await sys('결과: MAX COMBO 5년.');

  L = await scene(2, L => {
    L.className = 'layer sky';
    L.innerHTML = `
      <div class="board">${T.dice.map(([a, b], i) => `<div class="sq" data-i="${i}"><b>${i + 1}. ${a}</b>${b}</div>`).join('')}</div>
      <button class="dice" id="dice" aria-label="주사위 굴리기">${'<i></i>'.repeat(9)}</button>
      <div class="dice-cap blink" id="cap">탭해서 굴리기</div>`;
  }, '게임 룸 — 인생게임');
  const PIPS = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  const dice = $('#dice', L);
  const show = n => [...dice.children].forEach((p, i) => p.style.visibility = PIPS[n].includes(i) ? 'visible' : 'hidden');
  show(5);
  hint('보드게임 판입니다. 주사위를 굴려보세요.');
  await new Promise(r => dice.addEventListener('click', r, { once: true }));
  $('#cap', L).remove(); dice.classList.add('roll');
  for (let i = 0; i < 12; i++) { show(1 + Math.floor(Math.random() * 6)); sfx.blip(); await sleep(reduce ? 1 : 60); }
  const n = 1 + Math.floor(Math.random() * 6);
  dice.classList.remove('roll'); show(n); sfx.confirm();
  $(`.sq[data-i="${n - 1}"]`, L).classList.add('here');
  const [a, b] = T.dice[n - 1];
  await sys(`${n}! ${a} 칸에 도착했습니다. ${b}.`);
  await sys('닌텐도, 리듬게임, 인생게임, 보드게임. 이 파일은 늘 2P 모드였습니다.');
}

function rhythm(L) {
  return new Promise(resolve => {
    const FALL = 1500;                     // 노트가 떨어지는 시간(ms)
    const chart = [0, 600, 1100, 1500, 2100, 2500, 2900, 3500]; // 노트 타이밍
    const lanes = [...L.querySelectorAll('.lane')];
    const notes = []; let combo = 0;
    const t0 = performance.now() + 400;
    chart.forEach((t, i) => {
      const lane = lanes[i % 3 === 2 ? 1 : i % 2];
      setTimeout(() => {
        const n = document.createElement('div'); n.className = 'note';
        lane.appendChild(n);
        const hitY = lane.clientHeight * .84 - 9;
        n.animate([{ transform: 'translateY(0)' }, { transform: `translateY(${hitY + 20}px)`, offset: .8 }, { transform: `translateY(${lane.clientHeight + 40}px)` }],
          { duration: FALL * 1.25, easing: 'linear', fill: 'forwards' });
        notes.push({ el: n, lane, at: t0 + t + FALL, done: false });
      }, t + 400 - (reduce ? 0 : 0));
    });
    lanes.forEach(lane => lane.addEventListener('pointerdown', () => {
      lane.classList.add('flash'); setTimeout(() => lane.classList.remove('flash'), 90);
      const now = performance.now();
      const n = notes.find(n => !n.done && n.lane === lane && Math.abs(n.at - now) < 230);
      if (!n) return;
      n.done = true; n.el.classList.add('got'); setTimeout(() => n.el.remove(), 120);
      combo++; sfx.hit();
      $('#combo', L).textContent = 'COMBO ' + combo;
      const j = $('#judge', L); j.textContent = Math.abs(n.at - now) < 90 ? 'PERFECT' : 'GOOD';
      j.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, easing: 'steps(4)' });
    }));
    setTimeout(resolve, 400 + chart[chart.length - 1] + FALL + 700);
  });
}

// 여행과 일상의 추억 지도: 섬 지도 → 섬 → 추억. 가방과 열어본 기록은 이번 플레이 동안만 유지합니다.
const regionOf = id => T.regions.find(region => region.id === id);
const regionMemories = id => T.memories.filter(memory => memory.region === id);
function regionYears(id) {
  const years = [...new Set(regionMemories(id).filter(m => m.date).map(m => m.date.slice(0, 4)))].sort();
  return years.length > 1 ? `${years[0]}–${years[years.length - 1]}` : years[0] || T.album.undated;
}
// 버튼 중 하나가 눌리면 모두 잠그고 눌린 버튼을 돌려줍니다.
function pickButton(buttons) {
  return new Promise(resolve => {
    const done = new AbortController();
    buttons.forEach(b => b.addEventListener('click', () => {
      done.abort();
      buttons.forEach(x => { x.disabled = true; });
      sfx.select(); resolve(b);
    }, { signal: done.signal }));
  });
}
async function sMemories() {
  return withDialogInput(async () => {
    const seen = new Set(), bag = new Map();
    const started = () => T.regions.filter(r => regionMemories(r.id).some(m => seen.has(m.id))).length;
    const hub = regionOf('daily');
    let region = null, lastRegion = null, lastMemory = null;
    while (true) {
      if (!region) {
        const complete = started() === T.regions.length;
        const L = await scene(2, L => {
          L.className = 'layer memory-map memory-world';
          L.innerHTML = `<div class="memory-top"><h2>${T.album.title}</h2>${complete ? '' : `<button class="btn memory-skip" disabled>${T.album.skip}</button>`}</div>
            <p class="memory-progress" role="status">들른 섬 ${started()} / ${T.regions.length} · 열어본 추억 ${seen.size} / ${T.memories.length}</p>
            <p class="place-banner world-banner" aria-hidden="true"></p>
            <div class="world">
              <svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="${T.regions.filter(r => r !== hub).map(r => `M${hub.x} ${hub.y} L${r.x} ${r.y}`).join(' ')}" fill="none" stroke="#ffffff" stroke-opacity=".95" stroke-dasharray="8 8" vector-effect="non-scaling-stroke" style="stroke-width:5px;stroke-linecap:round"/>
              </svg>
              ${T.regions.map(r => {
                const list = regionMemories(r.id), opened = list.filter(m => seen.has(m.id)).length;
                return `<button class="island ${opened === list.length ? 'done' : ''}" data-region="${r.id}" style="left:${r.x}%;top:${r.y}%" aria-label="${r.name}, 추억 ${list.length}개 중 ${opened}개 열어봄" disabled>
                  <span class="island-icon">${svg(r.icon)}</span><span class="island-name">${r.name}</span><small>${opened} / ${list.length}</small>
                </button>`;
              }).join('')}
            </div>
            <section class="memory-bag" aria-labelledby="bag-title"><h3 id="bag-title">${T.album.bag} · ${bag.size}</h3>
              ${bag.size ? `<ul>${[...bag.values()].map(item => `<li><span>${svg(item.icon)}</span>${item.name}</li>`).join('')}</ul>` : `<p>${T.album.empty}</p>`}
            </section>
            <button class="btn memory-continue" disabled>${T.album.next}</button>
            ${complete ? '' : `<p class="small">${T.album.locked}</p>`}`;
        }, T.album.title);
        await hint(complete ? T.album.complete : T.album.intro);
        const islands = [...L.querySelectorAll('[data-region]')], next = $('.memory-continue', L);
        const banner = $('.world-banner', L);
        const show = b => {
          const r = regionOf(b.dataset.region);
          banner.textContent = `${r.name} · ${regionYears(r.id)} · 추억 ${regionMemories(r.id).length}개`;
        };
        islands.forEach(b => {
          b.disabled = false;
          b.addEventListener('focus', () => show(b));
          b.addEventListener('pointerenter', () => show(b));
        });
        next.disabled = !complete;
        const focus = islands.find(b => b.dataset.region === lastRegion) || islands[0];
        focus.focus({ preventScroll: true }); show(focus);
        if (lastRegion) focus.scrollIntoView({ block: 'nearest' });
        const skip = $('.memory-skip', L);
        if (skip) skip.disabled = false;
        let picked;
        while (true) {
          picked = await pickButton(complete ? [...islands, next] : [...islands, skip]);
          if (picked !== skip) break;
          // 아직 들르지 않은 섬이 있으면 정말 넘어갈지 확인합니다.
          [...islands, skip].forEach(b => { b.disabled = false; });
          skip.focus({ preventScroll: true });
          const left = T.regions.length - started();
          if (await confirmBox(T.album.skipConfirm.replace('{n}', left), T.album.skipYes, T.album.skipNo)) {
            [...islands, skip].forEach(b => { b.disabled = true; });
            break;
          }
        }
        if (picked === next || picked === skip) {
          for (const [who, line] of T.album.outro) await say(who, line);
          return;
        }
        region = picked.dataset.region; lastMemory = null;
        continue;
      }

      const info = regionOf(region), list = regionMemories(region);
      const L = await scene(2, L => {
        L.className = `layer memory-map memory-island memory-${info.theme}`;
        L.innerHTML = `<div class="island-hero"><h2 class="place-banner">${info.name}</h2><div class="memory-duo"></div></div>
          <p class="memory-progress" role="status">열어본 추억 ${list.filter(m => seen.has(m.id)).length} / ${list.length}</p>
          <div class="memory-grid">${list.map(memory => `
            <button class="btn memory-node ${seen.has(memory.id) ? 'visited' : ''}" data-memory="${memory.id}" disabled>
              <span class="memory-icon">${svg(memory.icon)}</span>
              <span><small>${memory.date || T.album.undated}</small><b>${memory.title}</b><small>${seen.has(memory.id) ? '다시 보기' : '열어보기'}</small></span>
            </button>`).join('')}</div>
          <button class="btn memory-back" disabled>${T.album.back}</button>`;
      }, `${T.album.title} · ${info.name}`);
      makeChar('jjun', 32, 96, $('.memory-duo', L));
      makeChar('wawa', 68, 96, $('.memory-duo', L));
      await hint(T.album.island);
      const buttons = [...L.querySelectorAll('[data-memory]')], back = $('.memory-back', L);
      [...buttons, back].forEach(b => { b.disabled = false; });
      const focus = buttons.find(b => b.dataset.memory === lastMemory) || buttons[0];
      focus.focus({ preventScroll: true });
      if (lastMemory) focus.scrollIntoView({ block: 'nearest' });
      const picked = await pickButton([...buttons, back]);
      if (picked === back) { lastRegion = region; region = null; continue; }

      const memory = T.memories.find(memory => memory.id === picked.dataset.memory);
      const page = await memoryStage({ ...memory, label: `${memory.date || T.album.undated} · ${info.name}` });
      for (const [who, line] of memory.lines) await say(who, line);
      for (const item of memory.items || []) {
        if (bag.has(item.id)) continue;
        const reward = document.createElement('div'); reward.className = 'memory-reward sticker';
        reward.innerHTML = `<span>${svg(item.icon)}</span><b>${item.name}</b>`;
        $('.memory-rewards', page).appendChild(reward);
        reward.scrollIntoView({ block: 'nearest' });
        bag.set(item.id, item); sfx.item();
        await sys(`${item.name}. ${T.album.collected}`);
      }
      seen.add(memory.id); lastMemory = memory.id;
    }
  });
}

// 4. 같은 관계를 다르게 경험한 두 사람
async function relationshipPage(page) {
  await scene(3, L => {
    L.className = 'layer sky relationship';
    L.tabIndex = 0;
    L.setAttribute('role', 'region');
    L.setAttribute('aria-label', page.title);
    L.innerHTML = `<p class="relationship-caption">두 사람의 입장 요약</p><h2>${page.title}</h2>
      <div class="perspectives">
        <section class="panel perspective"><h3><span>${svg('jjun')}</span>쭌</h3><p>${page.jjun}</p></section>
        <section class="panel perspective"><h3><span>${svg('wawa')}</span>와와</h3><p>${page.wawa}</p></section>
      </div>`;
  }, page.title);
  for (const [who, text] of page.lines) await say(who, text);
}
async function sDistance() {
  await withDialogInput(async () => {
    await scene(3, L => {
      L.className = 'layer sky relationship';
      L.innerHTML = '<p class="relationship-caption">약 5년의 관계</p><h2>좋았던 시간과 힘들었던 마음</h2><div class="relationship-pair">' + svg('jjun') + svg('wawa') + '</div>';
    }, '서로 다른 경험');
    for (const [who, text] of T.relationship.context) await say(who, text);
    for (const page of T.relationship.distance) await relationshipPage(page);
  });
}

// 4-1. 의도, 영향, 반복된 충돌과 화해
async function sCall() {
  await withDialogInput(async () => {
    for (const page of T.relationship.conversation) await relationshipPage(page);
  });
}

// 4-2. 두 입장을 읽은 뒤 실제 이별 기록으로 이어집니다.
async function sReplay() {
  await withDialogInput(async () => {
    const S = T.sides;
    const L = await scene(3, L => {
      const card = who => `
        <button class="card" data-who="${who}" aria-label="${NAMES[who]}의 입장 보기" aria-pressed="false" disabled>
          <div class="in">
            <div class="face front"><div class="pl">서로의 마음</div><div class="spr">${svg(who)}</div><div class="nm">${NAMES[who]}</div><div class="hint">눌러서 읽기</div></div>
            <div class="face back"><p><b>${NAMES[who]}의 마음</b>${S[who].heard}</p><p><b>바랐던 것과 한계</b>${S[who].stand}</p></div>
          </div>
        </button>`;
      L.className = 'layer sky';
      L.innerHTML = '<div class="cards replay">' + card('jjun') + card('wawa') + '</div>';
    }, '서로의 마음');
    await hint(T.relationship.replayHint);
    const seen = new Set();
    const cards = [...L.querySelectorAll('.card')];
    cards.forEach(card => {
      card.disabled = false;
      card.addEventListener('click', () => {
        const open = card.classList.toggle('flipped');
        card.setAttribute('aria-pressed', String(open)); sfx.select();
        if (open) seen.add(card.dataset.who);
        D.next.hidden = seen.size < 2;
      });
    });
    cards[0].focus({ preventScroll: true });
    do { await waitTap(); } while (seen.size < 2);
    cards.forEach(card => { card.disabled = true; });
    await scene(3, L => {
      L.className = 'layer sky relationship';
      L.innerHTML = '<p class="relationship-caption">마지막 대화</p><h2>고마움과 이별이 함께 남았다</h2><div class="relationship-pair">' + svg('jjun') + svg('wawa') + '</div>';
    }, '이별의 기록');
    for (const [who, text] of T.relationship.breakup) await say(who, text);
  });
}

// 5. 퀘스트 로그
async function sQuests() {
  await withDialogInput(async () => {
    const L = await scene(4, L => {
      L.className = 'layer sky qlog';
      L.innerHTML = '<h2>아직 하지 못한 것</h2>' + T.pending.map((quest, index) => `
        <button class="quest" aria-expanded="false" data-q="${index}" disabled>
          <div class="t"><span>${quest.title}</span><span class="s">${quest.status}</span></div>
          <div class="more"><div><p>${quest.description}</p></div><div>${svg(quest.icon)}</div></div>
        </button>`).join('');
    });
    await hint('남아 있는 약속을 눌러 확인하세요.');
    const seen = new Set();
    const buttons = [...L.querySelectorAll('.quest')];
    for (const button of buttons) {
      button.disabled = false;
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        buttons.forEach(other => other.setAttribute('aria-expanded', 'false'));
        button.setAttribute('aria-expanded', open); sfx.select();
        if (open) seen.add(button.dataset.q);
        D.next.hidden = seen.size !== T.pending.length;
      });
    }
    buttons[0].focus({ preventScroll: true });
    do { await waitTap(); } while (seen.size < T.pending.length);
    buttons.forEach(button => { button.disabled = true; });
    for (const quest of T.pending) await say('wawa', quest.line);
  });
}

// 6. 마지막 선택
async function sFinal() {
  const L = await scene(5, L => {
    L.className = 'layer sky center final';
    L.innerHTML = `
      <div class="duo-chars" id="dc"></div>
      <div class="save" style="pointer-events:none">
        <h3><span>FILE 01</span><span>쭌 &amp; 와와</span></h3>
        <dl><dt>플레이 시간</dt><dd>43,800:00</dd><dt>마지막 저장 위치</dt><dd class="blink">???</dd></dl>
      </div>`;
  });
  makeChar('jjun', 30, 100, $('#dc', L)); makeChar('wawa', 70, 100, $('#dc', L));
  await withDialogInput(async () => {
    for (const [who, text] of T.relationship.final) await say(who, text);
  });
  const OPTS = T.relationship.options;
  while (true) {
    speaker('sys'); await typeText('이 세이브 파일을 어떻게 이어갈까요?');
    const i = await choice(OPTS, { duo: true });
    if (await confirmBox(`'${OPTS[i]}'(으)로 저장할까요?`, '저장하기', '다시 고르기')) { sfx.save(); return i; }
  }
}

// 7-A. 엔딩: 대하 먹으러 가기
async function sEndingA() {
  const L = await scene(6, L => {
    L.className = 'layer map merge';
    L.innerHTML = `
      <svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 96 L50 52" fill="none" stroke="#ffffff" stroke-opacity=".95" stroke-dasharray="10 9" vector-effect="non-scaling-stroke" style="stroke-width:7px;stroke-linecap:round"/>
      </svg>
      <button class="shop" id="shop" style="left:50%;top:52%;border:0;background:none;padding:0">
        <span class="nm">대하집</span><span class="roof"></span>
        <span class="wall"><span class="shrimp">${svg('shrimp')}</span><span class="door"></span></span>
      </button>
      <div class="nextq" id="nq"><div class="fog" style="width:44px;height:32px"><div class="isl" style="left:8px;top:12px;width:20px;height:9px"></div><div class="mist"></div></div>NEXT: 일본 여행, 자취방 구하기, 결혼하기</div>`;
  }, 'IF — 상상 속 다음 챕터');
  const jj = makeChar('jjun', 42, 90, L), ww = makeChar('wawa', 58, 90, L);
  ww.dataset.keepSmile = '1';
  await sys(T.relationship.ifOpening);
  sfx.item(); toast('퀘스트 갱신: 대하 먹기 — 진행 중');
  await sys('새로운 장소가 열렸습니다.');
  $('#shop', L).classList.add('pulse');
  hint('대하집을 탭해서 함께 이동하세요.');
  await new Promise(r => $('#shop', L).addEventListener('click', r, { once: true }));
  hideDialog(); sfx.select();
  await Promise.all([walk(jj, 44, 62, 1400), walk(ww, 56, 62, 1400)]);
  setFace(ww, 'wawaSmile');
  await sys('대하집 앞에 도착했습니다.');
  await sys(T.relationship.ifTogether);
  await sys(T.relationship.ifBoundary);
  $('#nq', L).classList.add('on');
  await sys('맵 끝에 아직 열리지 않은 지역이 보입니다.');
  await saveCard('대하집 앞', 'CONTINUE', 'var(--amber)');
}

// 7-B. 엔딩: 각자의 길
async function sEndingB() {
  const L = await scene(6, L => {
    L.className = 'layer map fork';
    L.innerHTML = `
      <svg class="road" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 96 L50 64 L18 26 M50 64 L82 26" fill="none" stroke="#ffffff" stroke-opacity=".95" stroke-dasharray="10 9" vector-effect="non-scaling-stroke" style="stroke-width:7px;stroke-linecap:round"/>
      </svg>
      <span class="qtag" id="qa" style="left:18%;top:14%">쭌의 다음 챕터</span>
      <span class="qtag" id="qb" style="left:82%;top:14%">와와의 다음 챕터</span>`;
  }, '엔딩 — 각자의 다음 챕터');
  const jj = makeChar('jjun', 44, 76, L), ww = makeChar('wawa', 56, 76, L);
  await sys('길이 두 갈래로 나뉘어 있습니다.');
  hint('화면을 탭해서 각자의 길로 걸어가세요.');
  await waitTap(); hideDialog();
  await Promise.all([walk(jj, 32, 48, 1200), walk(ww, 68, 48, 1200)]);
  jj.classList.add('flip'); ww.classList.add('flip');   // 서로 돌아보기
  await alert(jj); await alert(ww);
  setFace(ww, 'wawaSmile');
  await sys(T.relationship.parting);
  jj.classList.remove('flip'); ww.classList.remove('flip'); setFace(ww, 'wawa');
  await Promise.all([walk(jj, 20, 30, 1200), walk(ww, 80, 30, 1200)]);
  $('#qa', L).classList.add('on'); $('#qb', L).classList.add('on');
  toast(T.relationship.parting);
  await sys('두 플레이어가 각자의 다음 챕터를 시작했습니다.');
  await saveCard('갈림길', 'RECORDED', 'var(--mint)');
}

// 엔딩 공통: 저장 카드 + 도장
async function saveCard(where, stamp, color) {
  const L = await scene(6, L => {
    L.className = 'layer sky center';
    L.innerHTML = `
      <div class="save stamped" style="pointer-events:none">
        <h3><span>FILE 01</span><span class="faces">${svg('jjun')}${svg('wawa')}</span></h3>
        <dl>
          <dt>플레이어</dt><dd>쭌 &amp; 와와</dd>
          <dt>플레이 시간</dt><dd>43,800:00</dd>
          <dt>마지막 저장 위치</dt><dd id="w">???</dd>
        </dl>
        <span class="stamp" id="st" style="color:${color}">${stamp}</span>
      </div>`;
  });
  await sleep(500);
  $('#w', L).textContent = where; sfx.select();
  await sleep(500);
  $('#st', L).classList.add('on'); sfx.save();
  await sys('저장했습니다.');
}

// 크레딧 (두 엔딩 공통)
async function sCredits() {
  const L = await scene(6, L => {
    L.className = 'layer sky center credits fadein';
    L.innerHTML = `
      <h2 class="title" style="font-size:34px">CONTINUE?</h2>
      <p class="k">PLAYER 1</p><p>쭌</p>
      <p class="k">PLAYER 2</p><p>와와</p>
      <div class="gap"></div>
      <p class="k">플레이 시간</p><p>43,800시간</p>
      <p class="k">자주 간 곳</p><p>제로백 PC방, 맛집 골목, 게임 룸</p>
      <p class="fin">THANK YOU FOR PLAYING</p>
      <button class="btn" id="again">타이틀로 돌아가기</button>`;
    [...L.children].forEach((c, i) => c.style.animationDelay = (i * .35) + 's');
  }, '크레딧');
  await new Promise(r => $('#again', L).addEventListener('click', r, { once: true }));
}

