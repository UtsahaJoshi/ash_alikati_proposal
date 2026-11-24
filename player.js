const player = document.querySelector('.player');
const audio = document.querySelector('#demo-audio');
const heroPlay = document.querySelector('#hero-play');
const playerPlay = document.querySelector('#player-play');
const seek = document.querySelector('#seek');
const elapsed = document.querySelector('#elapsed');
const duration = document.querySelector('#duration');
const error = document.querySelector('#player-error');
const playedWidth = document.querySelector('#played-width');

// RMS envelope of the bundled MP3, in 96 equal-duration intervals.
const envelope = [
  7, 9, 8, 8, 8, 11, 11, 11, 11, 10, 19, 18, 19, 19, 20, 19,
  18, 20, 18, 20, 21, 22, 22, 21, 23, 20, 19, 22, 19, 16, 25, 25,
  26, 21, 25, 25, 25, 25, 24, 23, 20, 20, 22, 18, 22, 22, 22, 22,
  19, 24, 23, 25, 25, 26, 26, 26, 23, 25, 23, 17, 24, 21, 19, 21,
  16, 26, 24, 23, 23, 22, 23, 23, 24, 25, 25, 25, 24, 26, 24, 13,
  27, 25, 26, 25, 26, 26, 25, 26, 26, 25, 9, 10, 10, 9, 14, 9,
];
const waveformPath = envelope.map((height, index) => {
  const top = (30 - height) / 2;
  return `M${index * 4 + 1} ${top}h2v${height}h-2z`;
}).join('');
for (const path of document.querySelectorAll('#waveform path')) {
  path.setAttribute('d', waveformPath);
}

function timeLabel(seconds) {
  const integer = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(integer / 60)}:${String(integer % 60).padStart(2, '0')}`;
}

function syncControls() {
  const playing = !audio.paused && !audio.ended;
  heroPlay.dataset.playing = String(playing);
  playerPlay.dataset.playing = String(playing);
  const label = playing ? 'Pause rough demo' : 'Play rough demo';
  heroPlay.lastElementChild.textContent = label;
  playerPlay.setAttribute('aria-label', label);
}

function updateTime() {
  elapsed.textContent = timeLabel(audio.currentTime);
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    seek.disabled = false;
    seek.max = String(audio.duration);
    seek.value = String(audio.currentTime);
    duration.textContent = timeLabel(audio.duration);
    seek.setAttribute('aria-valuetext', `${elapsed.textContent} of ${duration.textContent}`);
    playedWidth.setAttribute('width', String(384 * audio.currentTime / audio.duration));
  }
}

async function togglePlayback() {
  error.textContent = '';
  if (!audio.paused && !audio.ended) {
    audio.pause();
    return;
  }
  if (audio.error) audio.load();
  try {
    await audio.play();
  } catch (failure) {
    if (failure.name !== 'AbortError') {
      error.textContent = 'The demo could not play. Try again.';
    }
  }
}

for (const button of [heroPlay, playerPlay]) {
  button.addEventListener('click', togglePlayback);
}
for (const event of ['playing', 'pause', 'ended']) {
  audio.addEventListener(event, syncControls);
}
for (const event of ['loadedmetadata', 'durationchange', 'timeupdate']) {
  audio.addEventListener(event, updateTime);
}
audio.addEventListener('error', () => {
  error.textContent = 'The demo file could not be loaded.';
  seek.disabled = true;
  syncControls();
});
seek.addEventListener('input', () => {
  audio.currentTime = Number(seek.value);
  updateTime();
});

player.classList.add('enhanced');
syncControls();
updateTime();
