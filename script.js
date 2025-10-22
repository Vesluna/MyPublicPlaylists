/* script.js
   How to use:
   - Put this file trio (index.html, styles.css, script.js) at repo root.
   - Create a folder: /Playlists/
     Example structure:
     Playlists/
       manifest.json
       Alternate/
         cover.png
         01 - songA.mp3
         02 - songB.mp3
         ...
   - manifest.json format (example):
     [
       {
         "name": "Alternate",
         "folder": "Alternate",
         "cover": "cover.png"
       }
     ]
   - The player will read the manifest, then construct track URLs from each playlist folder.
   - If your files contain ID3 tags with track number / title / artist, the player will attempt to read them and sort by track number.
   - Favorites are stored in localStorage under 'pf_favs' (persisted).
*/

/* CONFIG */
const MANIFEST_PATH = "Playlists/manifest.json";
const PLAYLISTS_BASE = "Playlists/";

/* DOM */
const playlistGrid = document.getElementById("playlist-grid");
const favoritesGrid = document.getElementById("favorites-grid");
const overlay = document.getElementById("overlay");
const overlayClose = document.getElementById("overlay-close");
const overlayTitle = document.getElementById("overlay-title");
const overlayCover = document.getElementById("overlay-cover");
const overlayMeta = document.getElementById("overlay-meta");
const trackListEl = document.getElementById("trackList");
const audio = document.getElementById("audio");

const playBtn = document.getElementById("playBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const progress = document.getElementById("progress");
const curTime = document.getElementById("curTime");
const durTime = document.getElementById("durTime");
const favSongBtn = document.getElementById("favSongBtn");
const shuffleBtn = document.getElementById("shuffleBtn");

const btnPlaylists = document.getElementById("btn-playlists");
const btnFavs = document.getElementById("btn-favs");

let playlists = []; // loaded manifest with enriched track lists
let currentPlaylist = null;
let currentTrackIndex = 0;
let isPlaying = false;
let favs = loadFavs(); // { songs: Set, playlists: Set }
let shuffleFavorites = false;

/* helper to format time */
function fmt(s) {
  if (!s || isNaN(s)) return "0:00";
  s = Math.floor(s);
  const m = Math.floor(s / 60);
  const sec = (s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

/* localStorage favorites */
function loadFavs(){
  try{
    const raw = localStorage.getItem("pf_favs");
    if(!raw) return { songs: new Set(), playlists: new Set() };
    const parsed = JSON.parse(raw);
    return { songs: new Set(parsed.songs||[]), playlists: new Set(parsed.playlists||[]) };
  }catch(e){
    return { songs: new Set(), playlists: new Set() };
  }
}
function saveFavs(){
  const obj = { songs: Array.from(favs.songs), playlists: Array.from(favs.playlists) };
  localStorage.setItem("pf_favs", JSON.stringify(obj));
}

/* show small message in console and UI for debug */
function warn(msg){ console.warn(msg); }

/* Fetch manifest and initialize */
async function init(){
  try{
    const res = await fetch(MANIFEST_PATH);
    if(!res.ok) throw new Error("manifest not found: " + MANIFEST_PATH);
    const manifest = await res.json();
    // each item: { name, folder, cover }
    playlists = manifest.map(item => ({ ...item, tracks: [] }));
    // For each playlist, if a files[] is provided use it; otherwise expect user to list files in manifest.
    // We will attempt to fetch a playlist.json inside folder if present to get file list
    await Promise.all(playlists.map(loadPlaylist));
    renderPlaylists();
    renderFavorites(); // shows favorites tab grid prepped
  }catch(e){
    console.error(e);
    playlistGrid.innerHTML = `<div class="error">Manifest not found. Create <code>${MANIFEST_PATH}</code> with playlist list. See console for expected format.</div>`;
  }
}

/* Load a single playlist folder: tries playlist.json inside folder (file listing), otherwise relies on manifest listing */
async function loadPlaylist(p){
  const base = PLAYLISTS_BASE + p.folder + "/";
  // attempt to fetch playlist.json in the folder (optional)
  try{
    const res = await fetch(base + "playlist.json");
    if(res.ok){
      const data = await res.json();
      // data.files expected as array of filenames, or data.tracks richer metadata
      if(Array.isArray(data.files)){
        p.tracks = data.files.map(f => makeTrackObject(base + f));
      } else if(Array.isArray(data.tracks)){
        p.tracks = data.tracks.map(t => {
          if(!t.url) t.url = base + t.file;
          return { url: t.url, title: t.title || null, artist: t.artist || null, track: t.track || null, duration: t.duration || null, filename: t.file || extractFilename(t.url) };
        });
      }
    } else {
      // If playlist.json missing, check if manifest item has files embedded
      if (p.files && Array.isArray(p.files)) {
        p.tracks = p.files.map(f => makeTrackObject(base + f));
      } else {
        // No listing — warn user (can't list directory from client-side)
        warn(`No playlist.json or file list for folder ${p.folder}. Add playlist.json or include 'files' in manifest.`);
        p.tracks = [];
      }
    }
  }catch(err){
    warn("Error loading playlist " + p.folder + " : " + err.message);
    p.tracks = p.files && Array.isArray(p.files) ? p.files.map(f=>makeTrackObject(base + f)) : [];
  }

  // Attempt to read ID3 tags for each track and populate metadata, then sort by track number
  await enrichTracksWithTags(p.tracks);
  p.tracks.sort((a,b)=>{
    const ta = parseInt(a.track) || 9999;
    const tb = parseInt(b.track) || 9999;
    if(ta !== tb) return ta - tb;
    // fallback to filename alpha
    return (a.filename || a.url).localeCompare(b.filename || b.url, undefined, { numeric:true });
  });
}

/* turn url into track object */
function makeTrackObject(url){
  return {
    url,
    title: null,
    artist: null,
    track: null,
    duration: null,
    filename: extractFilename(url)
  };
}
function extractFilename(url){
  return url.split("/").pop();
}

/* Try to read ID3 tags and load duration */
async function enrichTracksWithTags(tracks){
  // read tags via jsmediatags and load metadata durations
  await Promise.all(tracks.map(async t=>{
    // attempt tag read
    try{
      await new Promise((res, rej)=>{
        window.jsmediatags && jsmediatags.read(t.url, {
          onSuccess: tag => {
            const tags = tag.tags || {};
            if(tags.title) t.title = tags.title;
            if(tags.artist) t.artist = tags.artist;
            if(tags.track) {
              // track sometimes like "1/10"
              t.track = (typeof tags.track === "object" ? tags.track : tags.track.toString()).split("/")[0];
            }
            res();
          },
          onError: (err) => {
            // just ignore
            res();
          }
        }) || res();
      });
    }catch(e){}
    // try to fetch duration by creating an Audio element and loading metadata
    try{
      t.duration = await getDuration(t.url);
    }catch(e){}
  }));
}

function getDuration(url){
  return new Promise((res, rej)=>{
    const a = new Audio();
    a.preload = "metadata";
    a.src = url;
    a.addEventListener('loadedmetadata', () => {
      res(a.duration);
    });
    a.addEventListener('error', ()=> res(null));
    // safety timeout
    setTimeout(()=>res(null), 5000);
  });
}

/* Rendering functions */
function renderPlaylists(){
  playlistGrid.innerHTML = "";
  playlists.forEach(p=>{
    const card = document.createElement("div");
    card.className = "card";
    card.title = p.name;
    const img = document.createElement("img");
    img.className = "cover-small";
    img.alt = p.name;
    img.src = PLAYLISTS_BASE + p.folder + "/" + (p.cover || p.coverImage || "cover.png");
    img.onerror = ()=>{ img.src = ""; img.style.background = "#fff"; img.style.height = "100px"; img.style.display = "block"; img.style.border = "3px dashed #000"; };
    const title = document.createElement("div");
    title.className = "title";
    title.textContent = p.name;
    const heart = document.createElement("button");
    heart.textContent = favs.playlists.has(p.folder) ? "★" : "☆";
    heart.className = "fav-pl";
    heart.style.border = "none";
    heart.style.background = "transparent";
    heart.style.fontWeight = "700";
    heart.addEventListener("click", (e)=>{
      e.stopPropagation();
      if(favs.playlists.has(p.folder)) favs.playlists.delete(p.folder);
      else favs.playlists.add(p.folder);
      saveFavs();
      heart.textContent = favs.playlists.has(p.folder) ? "★" : "☆";
      renderFavorites();
    });
    card.appendChild(img);
    card.appendChild(title);
    card.appendChild(heart);
    card.addEventListener("click", ()=> openPlaylist(p));
    playlistGrid.appendChild(card);
  });
}

/* Favorites grid — playlists and favorite songs mixed for quick access */
function renderFavorites(){
  favoritesGrid.innerHTML = "";
  // favorited playlists first (if any)
  playlists.forEach(p=>{
    if(favs.playlists.has(p.folder)){
      const card = document.createElement("div");
      card.className = "card";
      const img = document.createElement("img");
      img.className = "cover-small";
      img.src = PLAYLISTS_BASE + p.folder + "/" + (p.cover || "cover.png");
      const title = document.createElement("div");
      title.className = "title";
      title.textContent = p.name;
      card.appendChild(img);
      card.appendChild(title);
      card.addEventListener("click", ()=> openPlaylist(p));
      favoritesGrid.appendChild(card);
    }
  });

  // Now add favorite songs as small cards (randomized order)
  const favSongArray = Array.from(favs.songs);
  shuffleArray(favSongArray);
  favSongArray.forEach(s=>{
    // s is stored as full url string
    const card = document.createElement("div");
    card.className = "card";
    card.style.flexDirection = "row";
    card.style.justifyContent = "space-between";
    card.style.alignItems = "center";
    const info = document.createElement("div");
    info.innerHTML = `<div style="font-weight:700">${s.split("/").pop()}</div><div style="font-size:12px;color:#777">favorite</div>`;
    const btn = document.createElement("button");
    btn.textContent = "▶";
    btn.addEventListener("click", ()=> {
      // find the track in playlists
      let found=false;
      playlists.forEach(p=>{
        const idx = p.tracks.findIndex(t=>t.url===s);
        if(idx>=0){ openPlaylist(p, idx); found=true; }
      });
      if(!found) {
        // play direct
        playDirect(s);
      }
    });
    card.appendChild(info);
    card.appendChild(btn);
    favoritesGrid.appendChild(card);
  });

  // If empty show hint
  if(favoritesGrid.children.length === 0){
    favoritesGrid.innerHTML = `<div style="padding:12px; border:4px dashed var(--fg)">No favorites yet — favorite songs or playlists with the ☆ button.</div>`;
  }
}

/* Open playlist overlay; optionally start at a specific track index */
function openPlaylist(p, startIndex=0){
  currentPlaylist = p;
  currentTrackIndex = startIndex;
  overlayTitle.textContent = p.name;
  overlayCover.src = PLAYLISTS_BASE + p.folder + "/" + (p.cover || "cover.png");
  overlayMeta.textContent = `${p.tracks.length} tracks`;
  renderTrackList();
  overlay.classList.remove("hidden");
  overlay.setAttribute("aria-hidden", "false");
  // if there are tracks, load the chosen one
  if(p.tracks.length) loadTrack(currentTrackIndex);
}

/* Render the track list inside overlay */
function renderTrackList(){
  trackListEl.innerHTML = "";
  if(!currentPlaylist) return;
  currentPlaylist.tracks.forEach((t, i)=>{
    const li = document.createElement("li");
    li.dataset.index = i;
    const left = document.createElement("div");
    left.innerHTML = `<div style="font-weight:700">${t.title || t.filename}</div><div class="meta">${t.artist || ""}</div>`;
    const right = document.createElement("div");
    right.innerHTML = `<div class="meta">${t.track ? "Track "+t.track : ""} ${t.duration ? fmt(t.duration) : ""}</div>`;
    li.appendChild(left);
    li.appendChild(right);
    li.addEventListener("click", ()=> {
      loadTrack(i);
      playAudio();
    });
    if(t.url && favs.songs.has(t.url)){
      const star = document.createElement("span");
      star.style.marginLeft = "8px"; star.textContent = "★";
      left.appendChild(star);
    }
    trackListEl.appendChild(li);
  });
  highlightActiveTrack();
}

/* Highlight the currently playing track in list */
function highlightActiveTrack(){
  Array.from(trackListEl.children).forEach(li=>{
    li.classList.toggle("active", parseInt(li.dataset.index) === currentTrackIndex);
  });
}

/* loadTrack: sets audio.src and updates UI (no autoplay) */
function loadTrack(index){
  if(!currentPlaylist) return;
  const t = currentPlaylist.tracks[index];
  if(!t) return;
  currentTrackIndex = index;
  audio.src = t.url;
  overlayTitle.textContent = `${currentPlaylist.name} — ${t.title || t.filename}`;
  // update fav song button
  favSongBtn.textContent = favs.songs.has(t.url) ? "★" : "☆";
  highlightActiveTrack();
  // update duration when metadata loaded:
  audio.addEventListener('loadedmetadata', ()=> {
    durTime.textContent = fmt(audio.duration);
  }, { once:true });
}

/* Play/pause functions */
function playAudio(){
  audio.play().then(()=> {
    isPlaying = true;
    playBtn.textContent = "⏸";
  }).catch(e=>{
    console.warn("Playback failed:", e);
  });
}
function pauseAudio(){
  audio.pause();
  isPlaying = false;
  playBtn.textContent = "▶";
}

/* Play direct url (used from favorites) */
function playDirect(url){
  audio.src = url;
  currentPlaylist = null;
  currentTrackIndex = -1;
  audio.play();
  isPlaying = true;
  playBtn.textContent = "⏸";
  overlay.classList.add("hidden");
}

/* Next / Prev handling */
function nextTrack(){
  if(!currentPlaylist) return;
  currentTrackIndex++;
  if(currentTrackIndex >= currentPlaylist.tracks.length) currentTrackIndex = 0;
  loadTrack(currentTrackIndex);
  playAudio();
}
function prevTrack(){
  if(!currentPlaylist) return;
  currentTrackIndex--;
  if(currentTrackIndex < 0) currentTrackIndex = currentPlaylist.tracks.length - 1;
  loadTrack(currentTrackIndex);
  playAudio();
}

/* UI events wiring */
playBtn.addEventListener("click", ()=>{
  if(isPlaying) pauseAudio(); else playAudio();
});
prevBtn.addEventListener("click", prevTrack);
nextBtn.addEventListener("click", nextTrack);
overlayClose.addEventListener("click", ()=> {
  overlay.classList.add("hidden");
  overlay.setAttribute("aria-hidden", "true");
  // per your spec: closing overlay does NOT stop music
});
btnPlaylists.addEventListener("click", ()=> { btnPlaylists.classList.add("active"); btnFavs.classList.remove("active"); document.getElementById("playlist-grid").classList.remove("hidden"); document.getElementById("favorites-grid").classList.add("hidden"); });
btnFavs.addEventListener("click", ()=> { btnPlaylists.classList.remove("active"); btnFavs.classList.add("active"); document.getElementById("playlist-grid").classList.add("hidden"); document.getElementById("favorites-grid").classList.remove("hidden"); renderFavorites(); });

progress.addEventListener("input", ()=>{
  if(audio.duration) {
    audio.currentTime = (progress.value/100) * audio.duration;
  }
});

audio.addEventListener("timeupdate", ()=>{
  if(audio.duration){
    progress.value = (audio.currentTime / audio.duration) * 100;
    curTime.textContent = fmt(audio.currentTime);
    durTime.textContent = fmt(audio.duration);
  }
});

audio.addEventListener("ended", ()=>{
  // auto next
  if(currentPlaylist && currentPlaylist.tracks.length > 0) nextTrack();
});

favSongBtn.addEventListener("click", ()=>{
  const cur = currentPlaylist && currentPlaylist.tracks[currentTrackIndex];
  if(cur && cur.url){
    if(favs.songs.has(cur.url)) favs.songs.delete(cur.url);
    else favs.songs.add(cur.url);
    saveFavs();
    favSongBtn.textContent = favs.songs.has(cur.url) ? "★" : "☆";
    renderTrackList();
    renderFavorites();
  }
});
shuffleBtn.addEventListener("click", ()=>{
  shuffleFavorites = !shuffleFavorites;
  shuffleBtn.style.opacity = shuffleFavorites ? "1" : "0.6";
});

/* Utility: shuffle array */
function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]] = [arr[j],arr[i]];
  }
}

/* enrichTracksWithTags uses jsmediatags — this helper returns a Promise that finishes after tag attempts */
async function testTagRead(url){
  return new Promise((res)=> {
    if(window.jsmediatags){
      jsmediatags.read(url, {
        onSuccess: tag => res(tag.tags || {}),
        onError: err => res({})
      });
    } else res({});
  });
}

/* Render initial placeholder when clicking no playlists */
function showHelp(){
  playlistGrid.innerHTML = `<div style="padding:20px; border:4px dashed var(--fg)">No playlists found — add <code>${MANIFEST_PATH}</code> with array of playlist objects. Example manifest in project README. Then add folders under <code>Playlists/</code> with audio files and optional <code>playlist.json</code> or <code>cover.png</code>.</div>`;
}

/* When opening a playlist we may need to wait for track durations to finish loading for accurate info.
   But we did that during loadPlaylist; if user adds more files later, consider reloading.
*/

/* Initialization call */
init();
