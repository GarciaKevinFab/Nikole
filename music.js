// ====== Referencias DOM ======
const progress = document.getElementById("progress");
const song = document.getElementById("song");
const controlIcon = document.getElementById("controlIcon");
const playPauseButton = document.querySelector(".play-pause-btn");
const forwardButton = document.querySelector(".controls button.forward");
const backwardButton = document.querySelector(".controls button.backward");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");

// Volumen
const volumeSlider = document.getElementById("volume");
const muteBtn = document.querySelector(".mute-btn");
const volumeIcon = document.getElementById("volumeIcon");
const volumeValue = document.getElementById("volumeValue");

// ====== Playlist ======
const songs = [
  { title: "Alguien Como Tú", name: "Jósean Log", source: "Alguien.mp3" },
  { title: "Flores", name: "LATIN MAFIA", source: "FLORES.mp3" },
  { title: "Stand By Me", name: "Ben E. King", source: "Ben.mp3" },
  { title: "Interesante", name: "Gonzalo Genek, Lui5", source: "INTERESANTE.mp3" },
  { title: "Si Hay Algo", name: "Jósean Log", source: "Algo.mp3" },
];

let currentSongIndex = 0;
let lastNonZeroVolume = 1; // para restaurar al desmutear

// ====== Helpers ======
function updateLabels(index) {
  songTitle.textContent = songs[index].title;
  songArtist.textContent = songs[index].name;
}

function loadSong(index, autoplay = false) {
  // Pausa y resetea antes de cambiar
  song.pause();
  song.currentTime = 0;

  // Carga fuente nueva
  song.src = songs[index].source;
  song.load();

  // Actualiza títulos
  updateLabels(index);

  if (autoplay) playCurrent();
}

function playCurrent() {
  const start = () => {
    song.play().then(() => {
      controlIcon.classList.add("fa-pause");
      controlIcon.classList.remove("fa-play");
    }).catch(err => {
      console.warn("No se pudo reproducir (autoplay o error):", err);
      controlIcon.classList.remove("fa-pause");
      controlIcon.classList.add("fa-play");
    });
  };

  // Si ya hay datos suficientes, reproduce; si no, espera canplay
  if (song.readyState >= 2) start();
  else song.addEventListener("canplay", start, { once: true });
}

function pauseCurrent() {
  song.pause();
  controlIcon.classList.remove("fa-pause");
  controlIcon.classList.add("fa-play");
}

function nextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex, true);
}

function prevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex, true);
}

// ====== Volumen ======
function setVolumeUI(vol, muted = song.muted) {
  // Asegura valores
  const v = Math.min(1, Math.max(0, Number(vol)));
  if (!Number.isNaN(v)) {
    volumeSlider.value = v.toString();
    if (!muted) {
      // guarda última referencia útil
      if (v > 0) lastNonZeroVolume = v;
      volumeValue.textContent = `${Math.round(v * 100)}%`;
    }
  }

  // Ícono según estado
  volumeIcon.classList.remove("fa-volume-high", "fa-volume-low", "fa-volume-off", "fa-volume-xmark");
  if (muted || v === 0) {
    volumeIcon.classList.add("fa-volume-xmark"); // mute
    volumeValue.textContent = "0%";
  } else if (v < 0.33) {
    volumeIcon.classList.add("fa-volume-low");
  } else {
    volumeIcon.classList.add("fa-volume-high");
  }
}

function applySavedVolume() {
  const saved = localStorage.getItem("playerVolume");
  let v = 1;
  if (saved !== null) {
    const parsed = Number(saved);
    if (!Number.isNaN(parsed)) v = Math.min(1, Math.max(0, parsed));
  }
  song.volume = v;
  song.muted = (v === 0);
  if (v > 0) lastNonZeroVolume = v;
  setVolumeUI(v, song.muted);
}

// Eventos de volumen
if (volumeSlider) {
  volumeSlider.addEventListener("input", () => {
    const v = Number(volumeSlider.value);
    song.volume = v;
    song.muted = (v === 0);
    if (v > 0) lastNonZeroVolume = v;
    localStorage.setItem("playerVolume", v.toString());
    setVolumeUI(v, song.muted);
  });
}

if (muteBtn) {
  muteBtn.addEventListener("click", () => {
    if (song.muted || song.volume === 0) {
      // desmutear: restaura último volumen (>0) o 1
      const restore = lastNonZeroVolume > 0 ? lastNonZeroVolume : 1;
      song.muted = false;
      song.volume = restore;
      localStorage.setItem("playerVolume", restore.toString());
      setVolumeUI(restore, false);
    } else {
      // mutear
      song.muted = true;
      setVolumeUI(song.volume, true);
    }
  });
}

// ====== Eventos de audio ======
song.addEventListener("loadedmetadata", () => {
  progress.max = song.duration || 0;
  progress.value = 0;
});

song.addEventListener("timeupdate", () => {
  if (!song.paused) progress.value = song.currentTime;
});

song.addEventListener("ended", () => {
  nextSong(); // auto-next
});

// ====== Controles UI ======
playPauseButton.addEventListener("click", () => {
  // Si no hay src cargado aún (primer play), cargamos la actual y reproducimos
  if (!song.src) {
    loadSong(currentSongIndex, true);
    return;
  }
  if (song.paused) playCurrent();
  else pauseCurrent();
});

forwardButton.addEventListener("click", nextSong);
backwardButton.addEventListener("click", prevSong);

progress.addEventListener("input", () => {
  const v = Number(progress.value);
  if (!Number.isNaN(v)) song.currentTime = v;
});

progress.addEventListener("change", () => {
  if (song.src) playCurrent();
});

// ====== Init ======
document.addEventListener("DOMContentLoaded", () => {
  // Volumen inicial (de localStorage si existe)
  applySavedVolume();

  // Carga la primera canción sin reproducir (solo para mostrar título/artista)
  loadSong(currentSongIndex, false);
});
