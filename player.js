// ─── TRACK DATA ──────────────────────────────────────────────────────────────
// ✏️  ADD YOUR OWN SONGS HERE.
//
// For each track, fill in:
//   title    — song name
//   artist   — artist name
//   album    — album name and year (shown below title)
//   duration — display string like "3:45" (just for the sidebar label)
//   color    — art disc colour: "green" | "teal" | "violet" | "rose" | "amber" | "indigo"
//   src      — path to your audio file, e.g. "./audio/mysong.mp3"
//              or a full URL to a hosted MP3
//
// Place your MP3 files inside an "audio/" folder next to index.html.
//
const TRACKS = [
  {
    title: "I Like Me Better",
    artist: "lavu",
    album: "I met you when I was 18 · 2018",
    duration: "3:17",
    color: "green",
    src: "./audio/ilmbgit remoe.mp3"
  },
  {
    title: "Just One Day",
    artist: "BTS",
    album: "Skool Luv Affair · 2014",
    duration: "3:59",
    color: "teal",
    src: "./audio/just-oneday.mp3"
  },
  {
    title: "Kadhal En Kaviye",
    artist: "Sid Sriram",
    album: "Salmon 3D · 2021",
    duration: "5:11",
    color: "violet",
    src: "./audio/kaadhal-en-kaviye.mp3"
  },
  {
    title: "Maya Nadhi",
    artist: "Ananthu",
    album: "Kabali · 2016",
    duration: "3:04",
    color: "rose",
    src: "./audio/maya-nadhi.mp3"
  },
  {
    title: "Who Says",
    artist: "Selena Gomez",
    album: "When the Sun Goes Down · 2011",
    duration: "3:14",
    color: "amber",
    src: "./audio/selena-gomez_who-says.mp3"
  },
  {
    title: "Call It What You Want",
    artist: "Taylor Swift",
    album: "reputation · 2017",
    duration: "3:26",
    color: "indigo",
    src: "./audio/CIWYW.mp3"
  },
  {
    title: "Thanga Sela",
    artist: "Shankar Mahadevan",
    album: "Kaala · 2018",
    duration: "4:37",
    color: "indigo",
    src: "./audio/thanga sela.mp3"
  },
  {
    title: "Vaadi Pulla Vaadi",
    artist: "Hip Hop Tamizha",
    album: "Meesaya Murukku · 2014",
    duration: "4:40",
    color: "indigo",
    src: "./audio/vaadi-pulla-vaadi.mp3"
  }
];

// ─── STATE ───────────────────────────────────────────────────────────────────
let current   = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat  = false;
let volume    = 0.75;
let isMuted   = false;
let isDragging = false;

// ─── ELEMENTS ─────────────────────────────────────────────────────────────────
const audio       = document.getElementById('audioPlayer');
const playBtn     = document.getElementById('playBtn');
const prevBtn     = document.getElementById('prevBtn');
const nextBtn     = document.getElementById('nextBtn');
const shuffleBtn  = document.getElementById('shuffleBtn');
const repeatBtn   = document.getElementById('repeatBtn');
const muteBtn     = document.getElementById('muteBtn');
const seekBar     = document.getElementById('seekBar');
const seekFill    = document.getElementById('seekFill');
const seekThumb   = document.getElementById('seekThumb');
const volBar      = document.getElementById('volBar');
const volFill     = document.getElementById('volFill');
const volThumb    = document.getElementById('volThumb');
const currentTimeEl = document.getElementById('currentTime');
const durationEl  = document.getElementById('duration');
const trackTitle  = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const trackAlbum  = document.getElementById('trackAlbum');
const albumArt    = document.getElementById('albumArt');
const playlistEl  = document.getElementById('playlist');
const waveformEl  = document.getElementById('waveform');
const trackCountEl = document.getElementById('trackCount');

// ─── WAVEFORM CANVAS ─────────────────────────────────────────────────────────
const ctx = waveformEl.getContext('2d');
let waveformBars = [];

function generateWaveform() {
  waveformBars = Array.from({ length: 64 }, () => 0.15 + Math.random() * 0.85);
}

function drawWaveform(progress = 0) {
  const w = waveformEl.offsetWidth;
  const h = waveformEl.height;
  waveformEl.width = w;
  ctx.clearRect(0, 0, w, h);

  const barW = w / waveformBars.length - 1.5;
  const split = Math.floor(progress * waveformBars.length);

  waveformBars.forEach((val, i) => {
    const bh = val * h;
    const x  = i * (barW + 1.5);
    const y  = (h - bh) / 2;

    ctx.fillStyle = i < split
      ? 'rgba(124,106,247,0.85)'
      : 'rgba(58,58,85,0.6)';

    ctx.beginPath();
    ctx.roundRect(x, y, barW, bh, 2);
    ctx.fill();
  });
}

// ─── PLAYLIST RENDER ─────────────────────────────────────────────────────────
function renderPlaylist() {
  playlistEl.innerHTML = '';
  TRACKS.forEach((t, i) => {
    const li = document.createElement('li');
    li.className = `playlist-item${i === current ? ' active' : ''}`;
    li.dataset.index = i;
    li.innerHTML = `
      <span class="item-num">${String(i + 1).padStart(2, '0')}</span>
      <div class="item-info">
        <div class="item-title">${t.title}</div>
        <div class="item-artist">${t.artist}</div>
      </div>
      <span class="item-dur">${t.duration}</span>
    `;
    li.addEventListener('click', () => loadTrack(i, true));
    playlistEl.appendChild(li);
  });
  trackCountEl.textContent = `${TRACKS.length} tracks`;
}

// ─── LOAD TRACK ──────────────────────────────────────────────────────────────
function loadTrack(index, autoPlay = false) {
  current = index;
  const t = TRACKS[current];

  trackTitle.textContent  = t.title;
  trackArtist.textContent = t.artist;
  trackAlbum.textContent  = t.album;
  albumArt.dataset.color  = t.color;

  audio.src = t.src;
  seekFill.style.width  = '0%';
  seekThumb.style.left  = '0%';
  currentTimeEl.textContent = '0:00';
  durationEl.textContent    = t.duration;

  generateWaveform();
  drawWaveform(0);
  renderPlaylist();

  if (autoPlay) {
    audio.play().catch(err => console.log(err));
    setPlaying(true);
  } else {
    setPlaying(false);
  }
}

// ─── PLAY / PAUSE ─────────────────────────────────────────────────────────────
function setPlaying(state) {
  isPlaying = state;
  playBtn.querySelector('.icon-play').style.display  = isPlaying ? 'none' : '';
  playBtn.querySelector('.icon-pause').style.display = isPlaying ? '' : 'none';
  if (isPlaying) {
    albumArt.classList.add('spinning');
  } else {
    albumArt.classList.remove('spinning');
  }
}

playBtn.addEventListener('click', () => {
  if (audio.src) {
    if (isPlaying) { audio.pause(); setPlaying(false); }
    else           { audio.play();  setPlaying(true);  }
  } else {
    loadTrack(0, true);
  }
});

// ─── PREV / NEXT ─────────────────────────────────────────────────────────────
function prevTrack() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  const idx = isShuffle
    ? randomIndex()
    : (current - 1 + TRACKS.length) % TRACKS.length;
  loadTrack(idx, isPlaying);
}

function nextTrack() {
  const idx = isShuffle
    ? randomIndex()
    : (current + 1) % TRACKS.length;
  loadTrack(idx, isPlaying);
}

function randomIndex() {
  let idx;
  do { idx = Math.floor(Math.random() * TRACKS.length); }
  while (idx === current && TRACKS.length > 1);
  return idx;
}

prevBtn.addEventListener('click', prevTrack);
nextBtn.addEventListener('click', nextTrack);

// ─── SHUFFLE / REPEAT ────────────────────────────────────────────────────────
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.classList.toggle('active-mode', isShuffle);
});

repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.classList.toggle('active-mode', isRepeat);
  audio.loop = isRepeat;
});

// ─── AUDIO EVENTS ────────────────────────────────────────────────────────────
audio.addEventListener('timeupdate', () => {
  if (!audio.duration || isDragging) return;
  const pct = audio.currentTime / audio.duration;
  seekFill.style.width  = `${pct * 100}%`;
  seekThumb.style.left  = `${pct * 100}%`;
  currentTimeEl.textContent = formatTime(audio.currentTime);
  drawWaveform(pct);
});

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('ended', () => {
  if (!isRepeat) nextTrack();
});

// ─── SEEK ─────────────────────────────────────────────────────────────────────
function setSeekByEvent(e) {
  const rect = seekBar.getBoundingClientRect();
  const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (audio.duration) {
    audio.currentTime = pct * audio.duration;
    seekFill.style.width = `${pct * 100}%`;
    seekThumb.style.left = `${pct * 100}%`;
    drawWaveform(pct);
  }
}

seekBar.addEventListener('mousedown', e => {
  isDragging = true;
  setSeekByEvent(e);
});
document.addEventListener('mousemove', e => { if (isDragging) setSeekByEvent(e); });
document.addEventListener('mouseup',  () => { isDragging = false; });

// ─── VOLUME ───────────────────────────────────────────────────────────────────
function setVolume(pct) {
  volume = Math.max(0, Math.min(1, pct));
  audio.volume   = isMuted ? 0 : volume;
  volFill.style.width = `${volume * 100}%`;
  volThumb.style.left = `${volume * 100}%`;
}

volBar.addEventListener('click', e => {
  const rect = volBar.getBoundingClientRect();
  setVolume((e.clientX - rect.left) / rect.width);
  if (isMuted) toggleMute();
});

muteBtn.addEventListener('click', toggleMute);

function toggleMute() {
  isMuted = !isMuted;
  audio.volume = isMuted ? 0 : volume;
  muteBtn.style.color = isMuted ? 'var(--danger)' : '';
}

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  switch (e.code) {
    case 'Space':      e.preventDefault(); playBtn.click(); break;
    case 'ArrowRight': audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); break;
    case 'ArrowLeft':  audio.currentTime = Math.max(0, audio.currentTime - 5); break;
    case 'ArrowUp':    setVolume(volume + 0.05); break;
    case 'ArrowDown':  setVolume(volume - 0.05); break;
    case 'KeyN':       nextTrack(); break;
    case 'KeyP':       prevTrack(); break;
    case 'KeyM':       toggleMute(); break;
  }
});

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function formatTime(sec) {
  if (!isFinite(sec)) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// ─── INIT ────────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => drawWaveform(
  audio.duration ? audio.currentTime / audio.duration : 0
));

audio.volume = volume;
generateWaveform();
renderPlaylist();
loadTrack(0, false);
drawWaveform(0);