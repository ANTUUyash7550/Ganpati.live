const CONFIG = {
  // Your deployed Google Apps Script Web App URL.
  backendUrl: "https://script.google.com/macros/s/AKfycbyOVDiYvlZwVs9rcSJ7YXiSy_nFZkytcgCndw12Y1B1t08bFIjtgiL019Kji6vXJFlUVA/exec",
  tracks: [
    { title: "Karpur Gauram", videoId: "uwXW1uRntEo", credit: "Times Music Spiritual", url: "https://www.youtube.com/watch?v=uwXW1uRntEo" },
    { title: "Shiv Mantra", videoId: "A5vvJVvNTVA", credit: "Times Music Spiritual", url: "https://www.youtube.com/watch?v=A5vvJVvNTVA" },
    { title: "Ghalin Lotangan", videoId: "kmmmZn4cQmU", credit: "Sony Music India", url: "https://www.youtube.com/watch?v=kmmmZn4cQmU" },
    { title: "Tvamev Mata", videoId: "t2TGoZ2Tyz4", credit: "Saregama Bhakti", url: "https://www.youtube.com/watch?v=t2TGoZ2Tyz4" },
    { title: "Achyutam Keshavam", videoId: "cahzV2jYhjU", credit: "Zee Music Company / Alka Yagnik", url: "https://www.youtube.com/watch?v=cahzV2jYhjU" },
    { title: "Hare Ram Mahamantra", videoId: "YOaX0Jnne4I", credit: "ISKCON Desire Tree / Lokanath Swami", url: "https://www.youtube.com/watch?v=YOaX0Jnne4I" }
  ]
};

const bell = document.getElementById("aartiBell");
const statusEl = document.getElementById("aartiStatus");
const modal = document.getElementById("outsideMessage");
const closeModal = document.getElementById("closeMessage");
const creditList = document.getElementById("creditList");
const playPause = document.getElementById("playPause");
const prevTrack = document.getElementById("prevTrack");
const nextTrack = document.getElementById("nextTrack");
const progressBar = document.getElementById("progressBar");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const nowPlayingTitle = document.getElementById("nowPlayingTitle");
const nowPlayingCredit = document.getElementById("nowPlayingCredit");

let index = 0;
let ytPlayer = null;
let ytReady = false;
let userStarted = false;
let progressTimer = null;

function inAartiSession(date = new Date()) {
  const mins = date.getHours() * 60 + date.getMinutes();
  return (mins >= 300 && mins < 540) || (mins >= 1110 && mins < 1200);
}
function sessionName(date = new Date()) {
  const mins = date.getHours() * 60 + date.getMinutes();
  if (mins >= 300 && mins < 540) return "Morning Aarti";
  if (mins >= 1110 && mins < 1200) return "Evening Aarti";
  return "Aarti";
}
function fmtTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function renderCredits() {
  creditList.innerHTML = CONFIG.tracks.map((track, i) => `
    <a class="credit-item" href="${track.url}" target="_blank" rel="noopener noreferrer">
      <span>${i + 1}. ${track.title}</span><small>${track.credit} ↗</small>
    </a>`).join("");
}
function updateTrackUI() {
  const track = CONFIG.tracks[index];
  nowPlayingTitle.textContent = track.title;
  nowPlayingCredit.textContent = track.credit;
  progressBar.value = 0;
  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
}
function loadYouTubeAPI() {
  if (window.YT && window.YT.Player) { createPlayer(); return; }
  if (document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) return;
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.head.appendChild(tag);
}
window.onYouTubeIframeAPIReady = createPlayer;
function createPlayer() {
  if (ytPlayer || !document.getElementById("youtubePlayer")) return;
  ytPlayer = new YT.Player("youtubePlayer", {
    width: "1", height: "1", videoId: CONFIG.tracks[index].videoId,
    playerVars: { controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3, modestbranding: 1, playsinline: 1, rel: 0 },
    events: {
      onReady: () => { ytReady = true; updateTrackUI(); },
      onStateChange: onPlayerStateChange,
      onError: () => { statusEl.textContent = "This prayer cannot play here. Use its original source below."; }
    }
  });
}
function startProgress() {
  clearInterval(progressTimer);
  progressTimer = setInterval(() => {
    if (!ytPlayer || !ytReady) return;
    const t = ytPlayer.getCurrentTime() || 0;
    const d = ytPlayer.getDuration() || 0;
    currentTimeEl.textContent = fmtTime(t);
    durationEl.textContent = fmtTime(d);
    progressBar.value = d ? (t / d) * 100 : 0;
  }, 500);
}
function stopProgress() { clearInterval(progressTimer); }
function playCurrent() {
  if (!inAartiSession()) { showOutsideMessage(); return; }
  if (!ytReady) { loadYouTubeAPI(); statusEl.textContent = "Starting Aarti…"; return; }
  userStarted = true;
  ytPlayer.loadVideoById(CONFIG.tracks[index].videoId);
  ytPlayer.playVideo();
}
function setTrack(i, autoplay = false) {
  index = (i + CONFIG.tracks.length) % CONFIG.tracks.length;
  updateTrackUI();
  if (!ytReady) return;
  ytPlayer.loadVideoById(CONFIG.tracks[index].videoId);
  if (autoplay && inAartiSession()) { userStarted = true; ytPlayer.playVideo(); }
}
function showOutsideMessage() { modal.classList.remove("hidden"); }
function refreshSession() {
  if (!inAartiSession()) {
    if (ytPlayer && ytReady) ytPlayer.pauseVideo();
    userStarted = false;
    playPause.textContent = "▶";
    statusEl.textContent = "Aarti Time Only • Tap the bell during the prayer session";
  } else if (!userStarted) {
    statusEl.textContent = "Tap the bell to start Aarti";
  }
}
function togglePlayback() {
  if (!inAartiSession()) { showOutsideMessage(); return; }
  if (!ytReady) { loadYouTubeAPI(); statusEl.textContent = "Starting Aarti…"; return; }
  const state = ytPlayer.getPlayerState();
  if (state === YT.PlayerState.PLAYING) { ytPlayer.pauseVideo(); }
  else { userStarted = true; ytPlayer.playVideo(); }
}
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    playPause.textContent = "Ⅱ"; playPause.setAttribute("aria-label", "Pause");
    statusEl.textContent = `${sessionName()} • Playing`; startProgress();
  } else if (event.data === YT.PlayerState.PAUSED) {
    playPause.textContent = "▶"; playPause.setAttribute("aria-label", "Play");
    statusEl.textContent = "Aarti paused • Tap play to continue"; stopProgress();
  } else if (event.data === YT.PlayerState.ENDED) {
    stopProgress();
    if (inAartiSession()) setTrack(index + 1, true); else refreshSession();
  }
}
bell.addEventListener("click", togglePlayback);
playPause.addEventListener("click", togglePlayback);
prevTrack.addEventListener("click", () => setTrack(index - 1, userStarted));
nextTrack.addEventListener("click", () => setTrack(index + 1, userStarted));
progressBar.addEventListener("input", () => {
  if (!ytPlayer || !ytReady) return;
  const d = ytPlayer.getDuration() || 0;
  if (d) ytPlayer.seekTo((Number(progressBar.value) / 100) * d, true);
});
closeModal.addEventListener("click", () => modal.classList.add("hidden"));
updateTrackUI(); renderCredits(); loadYouTubeAPI(); refreshSession(); setInterval(refreshSession, 15000);

// Registration
const form = document.getElementById("registrationForm");
const username = document.getElementById("instagram");
const generateBtn = document.getElementById("generateBtn");
const result = document.getElementById("registrationResult");
const codeValue = document.getElementById("codeValue");
const copyBtn = document.getElementById("copyCode");
const resultMessage = document.getElementById("resultMessage");

function cleanUsername(v) { return v.trim().replace(/^@+/, "").replace(/\s+/g, ""); }

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const handle = cleanUsername(username.value);
  if (!/^[A-Za-z0-9._]{1,30}$/.test(handle)) {
    resultMessage.textContent = "Please enter a valid Instagram username.";
    result.classList.remove("hidden");
    return;
  }
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating…";
  resultMessage.textContent = "";
  try {
    const response = await fetch(CONFIG.backendUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "register", instagram: handle })
    });
    if (!response.ok) throw new Error(`Server error (${response.status})`);
    const data = await response.json();
    if (!data.ok) throw new Error(data.error || "Registration failed");
    codeValue.textContent = data.code;
    result.classList.remove("hidden");
    resultMessage.textContent = data.existing
      ? "This username is already registered. Your existing code is shown above."
      : "Registration saved successfully.";
  } catch (err) {
    result.classList.remove("hidden");
    resultMessage.textContent = "Registration could not be completed. Please try again.";
    console.error("GanpatiLive registration error:", err);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate Code";
  }
});

copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(codeValue.textContent);
    copyBtn.textContent = "Copied ✓";
    setTimeout(() => copyBtn.textContent = "Copy Code", 1600);
  } catch {
    resultMessage.textContent = "Copy failed. Please copy the code manually.";
  }
});
