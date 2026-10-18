const sections = [
  { img: 'images/IMG_0036.JPG', text: ['Hey love, happy birthday! ❤️'] },
  { img: 'images/IMG_0038.JPG', text: ['From the person who probably loves you more than anyone else.'] },
  {
    img: 'images/IMG_0040.JPG',
    text: [
      'I may not always know how to express my feelings.',
      'I may still be a little immature sometimes.',
      'But one thing I know for sure is that my heart belongs to you.',
    ],
  },
  { img: 'images/IMG_0042.JPG', text: ['I hope that from this birthday onward, you never have a reason to cry.'] },
  { img: 'images/IMG_0045.JPG', text: ['And whenever you feel alone or think nobody cares, remember that I am always here for you.'] },
  { img: 'images/IMG_0046.JPG', text: ['How lucky am I to get to spend this life by your side.'] },
  { img: 'images/IMG_0047.JPG', text: ['For as long as I exist, you will always be loved, cherished, and cared for.'] },
  { img: 'images/IMG_0048.JPG', text: ['Happy Birthday, my love. ❤️✨'] },
];

const track = document.getElementById('track');
const dotsEl = document.getElementById('dots');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finale = document.getElementById('finale');

let current = 0;
let openedCount = 0; // cards before this index are open; this index is the next one to unlock

const cards = sections.map((s, i) => {
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `Open card ${i + 1}`);
  const isLong = s.text.join(' ').length > 110;
  card.innerHTML = `
    <div class="card-inner">
      <div class="face front">
        <svg class="heart" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 20.5s-7.5-4.6-9.3-9.4C1.4 7.6 3.6 4 7.1 4c2 0 3.6 1.1 4.9 2.9C13.3 5.1 14.9 4 16.9 4c3.5 0 5.7 3.6 4.4 7.1-1.8 4.8-9.3 9.4-9.3 9.4z"/>
        </svg>
        <div class="tap"></div>
      </div>
      <div class="face back" style="background-image:url('${s.img}')">
        <div class="message${isLong ? ' long' : ''}">
          ${s.text.map((t) => `<p>${t}</p>`).join('')}
        </div>
      </div>
    </div>`;
  card.addEventListener('click', () => openCard(i));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(i); }
  });
  track.appendChild(card);

  const dot = document.createElement('button');
  dot.className = 'dot';
  dot.setAttribute('aria-label', `Go to card ${i + 1}`);
  dot.addEventListener('click', () => goTo(i));
  dotsEl.appendChild(dot);

  new Image().src = s.img;
  return card;
});

function openCard(i) {
  if (i !== openedCount) return;
  cards[i].classList.add('open');
  openedCount++;
  update();
  if (openedCount === sections.length) {
    setTimeout(() => {
      finale.hidden = false;
      for (let k = 0; k < 15; k++) setTimeout(spawnLantern, k * 200);
    }, 1500);
  }
}

function goTo(i) {
  if (i < 0 || i >= sections.length || i > openedCount) return;
  current = i;
  update();
}

function update() {
  track.style.transform = `translateX(-${current * 100}%)`;
  cards.forEach((c, i) => {
    c.classList.toggle('locked', i > openedCount);
    c.querySelector('.tap').textContent = i > openedCount ? 'Locked' : 'Tap to open';
  });
  [...dotsEl.children].forEach((d, i) => {
    d.classList.toggle('active', i === current);
    d.classList.toggle('opened', i < openedCount);
    d.disabled = i > openedCount;
  });
  prevBtn.disabled = current === 0;
  nextBtn.disabled = current >= sections.length - 1 || current >= openedCount;
}

prevBtn.addEventListener('click', () => goTo(current - 1));
nextBtn.addEventListener('click', () => goTo(current + 1));
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') goTo(current - 1);
  if (e.key === 'ArrowRight') goTo(current + 1);
});

let touchX = null;
track.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
track.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

// A few slow, floating Tangled lanterns in the background
const lanternLayer = document.getElementById('lanterns');
function spawnLantern() {
  const l = document.createElement('div');
  l.className = 'lantern';
  const scale = 0.6 + Math.random() * 0.8;
  l.style.left = Math.random() * 100 + 'vw';
  l.style.transform = `scale(${scale})`;
  l.style.width = 10 * scale + 'px';
  l.style.height = 14 * scale + 'px';
  l.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
  const dur = 18 + Math.random() * 12;
  l.style.animationDuration = dur + 's';
  lanternLayer.appendChild(l);
  setTimeout(() => l.remove(), dur * 1000);
}
for (let i = 0; i < 5; i++) setTimeout(spawnLantern, i * 1500);
setInterval(spawnLantern, 3500);

// Background music: browsers block autoplay, so start on the first interaction
const audioEl = document.getElementById('bgMusic');
const musicToggle = document.getElementById('musicToggle');
const VOLUME = 0.5;
audioEl.volume = VOLUME;
let userPaused = false;
let playing = false;

// Fallback for browsers whose <audio> can't load the local file: decode and loop via Web Audio
let ctx = null;
let webAudioReady = null;
function initWebAudio() {
  if (!webAudioReady) {
    webAudioReady = fetch(audioEl.src)
      .then((r) => r.arrayBuffer())
      .then((buf) => {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
        return ctx.decodeAudioData(buf);
      })
      .then((decoded) => {
        const gain = ctx.createGain();
        gain.gain.value = VOLUME;
        gain.connect(ctx.destination);
        const src = ctx.createBufferSource();
        src.buffer = decoded;
        src.loop = true;
        src.connect(gain);
        src.start();
      });
  }
  return webAudioReady;
}
const useWebAudio = () => !!audioEl.error;

function setMusicUI() {
  musicToggle.classList.toggle('playing', playing);
  const label = playing ? 'Pause music' : 'Play music';
  musicToggle.setAttribute('aria-label', label);
  musicToggle.title = label;
}

function playMusic() {
  const p = useWebAudio()
    ? initWebAudio().then(() => ctx.resume())
    : audioEl.play();
  p.then(() => { playing = true; setMusicUI(); })
    .catch(() => { playing = false; setMusicUI(); });
}

function pauseMusic() {
  if (useWebAudio()) { if (ctx) ctx.suspend(); }
  else audioEl.pause();
  playing = false;
  setMusicUI();
}

musicToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  if (playing) { userPaused = true; pauseMusic(); }
  else { userPaused = false; playMusic(); }
});

function startOnFirstInteraction(e) {
  if (musicToggle.contains(e.target)) return;
  if (!userPaused && !playing) playMusic();
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.removeEventListener(ev, startOnFirstInteraction));
}
['pointerdown', 'keydown', 'touchstart'].forEach((ev) => document.addEventListener(ev, startOnFirstInteraction));

playMusic(); // works if the browser allows autoplay

update();
