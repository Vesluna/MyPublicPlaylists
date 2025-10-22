// ============================================
// PLAYLIST CONFIGURATION
// ============================================
// To add more playlists, edit this section:
const PLAYLISTS = {
    alternate: {
        name: "ALTERNATE",
        coverArt: "Playlists/Alternate/cover.png",
        tracks: [
            {
                file: "Playlists/Alternate/Options.mp3",
                title: "Options",
                artist: "Vesluna",
                trackNumber: 1
            }
        ]
    }
};
// ============================================

// State Management
let currentPlaylist = null;
let currentTrackIndex = 0;
let isPlaying = false;
let favorites = {
    playlists: [],
    tracks: []
};

// DOM Elements
const audio = document.getElementById('audio-player');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playerTitle = document.getElementById('player-title');
const playerArtist = document.getElementById('player-artist');
const playerCover = document.getElementById('player-cover');
const favoriteTrackBtn = document.getElementById('favorite-track-btn');
const favoritePlaylistBtn = document.getElementById('favorite-playlist-btn');
const fullscreenOverlay = document.getElementById('fullscreen-overlay');
const closeBtn = document.getElementById('close-btn');
const fullscreenTitle = document.getElementById('fullscreen-title');
const fullscreenCover = document.getElementById('fullscreen-cover');
const trackList = document.getElementById('track-list');
const playlistGrid = document.getElementById('playlist-grid');
const favoritesGrid = document.getElementById('favorites-grid');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Error Display
function showError(title, message, solution) {
    document.body.innerHTML = `
        <div style="
            position: fixed;
            inset: 0;
            background-color: #FFFFFF;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 32px;
            font-family: 'Press Start 2P', monospace;
            z-index: 9999;
        ">
            <div style="
                max-width: 600px;
                border: 4px solid #000000;
                padding: 32px;
                text-align: center;
            ">
                <div style="font-size: 24px; margin-bottom: 24px;">⚠</div>
                <h1 style="font-size: 12px; margin-bottom: 24px;">${title}</h1>
                <p style="font-size: 8px; line-height: 1.8; margin-bottom: 24px; font-family: 'Courier New', monospace;">
                    ${message}
                </p>
                <div style="
                    background-color: #000000;
                    color: #FFFFFF;
                    padding: 16px;
                    font-size: 7px;
                    line-height: 1.8;
                    text-align: left;
                    font-family: 'Courier New', monospace;
                    margin-bottom: 24px;
                ">
                    ${solution}
                </div>
                <p style="font-size: 6px; font-family: 'Courier New', monospace; opacity: 0.7;">
                    Refresh the page after fixing the issue
                </p>
            </div>
        </div>
    `;
}

// Initialize App
function init() {
    // Validate playlists configuration
    if (!PLAYLISTS || Object.keys(PLAYLISTS).length === 0) {
        showError(
            'NO PLAYLISTS CONFIGURED',
            'The PLAYLISTS configuration is empty.',
            'HOW TO FIX:<br><br>1. Open script.js<br>2. Find the PLAYLISTS configuration at the top<br>3. Add your playlist information<br>4. Save and refresh<br><br>Example:<br>const PLAYLISTS = {<br>  myplaylist: {<br>    name: "MY PLAYLIST",<br>    coverArt: "Playlists/MyPlaylist/cover.png",<br>    tracks: [...]<br>  }<br>};'
        );
        return;
    }
    
    // Validate playlist structure
    for (const [id, playlist] of Object.entries(PLAYLISTS)) {
        if (!playlist.name || !playlist.coverArt || !playlist.tracks) {
            showError(
                'INVALID PLAYLIST CONFIG',
                `Playlist "${id}" is missing required fields.`,
                `HOW TO FIX:<br><br>Each playlist must have:<br>- name: "Display Name"<br>- coverArt: "path/to/cover.png"<br>- tracks: [ array of tracks ]<br><br>Check script.js and fix the playlist configuration.`
            );
            return;
        }
        
        if (!Array.isArray(playlist.tracks) || playlist.tracks.length === 0) {
            showError(
                'NO TRACKS IN PLAYLIST',
                `Playlist "${playlist.name}" has no tracks.`,
                `HOW TO FIX:<br><br>1. Open script.js<br>2. Add tracks to the "${id}" playlist<br>3. Each track needs:<br>   - file: "path/to/song.mp3"<br>   - title: "Song Title"<br>   - artist: "Artist Name"<br>   - trackNumber: 1<br>4. Save and refresh`
            );
            return;
        }
    }
    
    loadFavorites();
    renderPlaylists();
    renderFavorites();
    setupEventListeners();
}

// Load favorites from localStorage
function loadFavorites() {
    const stored = localStorage.getItem('playlist-favorites');
    if (stored) {
        try {
            favorites = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading favorites:', e);
            favorites = { playlists: [], tracks: [] };
        }
    }
}

// Save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('playlist-favorites', JSON.stringify(favorites));
}

// Render playlists grid
function renderPlaylists() {
    playlistGrid.innerHTML = '';
    
    Object.entries(PLAYLISTS).forEach(([id, playlist]) => {
        const card = createPlaylistCard(id, playlist);
        playlistGrid.appendChild(card);
    });
}

// Create playlist card
function createPlaylistCard(id, playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.dataset.testid = `playlist-card-${id}`;
    
    const isFavorited = favorites.playlists.includes(id);
    
    card.innerHTML = `
        <div class="playlist-cover-wrapper">
            <img src="${playlist.coverArt}" alt="${playlist.name}" class="playlist-cover" 
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23000%22 width=%22200%22 height=%22200%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23FFF%22 font-family=%22monospace%22 font-size=%2212%22 text-anchor=%22middle%22 dy=%22.3em%22>NO IMAGE</text></svg>'">
            ${isFavorited ? '<div class="favorite-indicator">★</div>' : ''}
        </div>
        <div class="playlist-info">
            <div class="playlist-name">${playlist.name}</div>
            <div class="playlist-count">${playlist.tracks.length} TRACKS</div>
        </div>
    `;
    
    card.addEventListener('click', () => openPlaylist(id, playlist));
    
    return card;
}

// Open playlist in fullscreen view
function openPlaylist(id, playlist) {
    currentPlaylist = { id, ...playlist };
    
    // Sort tracks by track number
    currentPlaylist.tracks.sort((a, b) => a.trackNumber - b.trackNumber);
    
    fullscreenTitle.textContent = playlist.name;
    fullscreenCover.src = playlist.coverArt;
    fullscreenCover.onerror = function() {
        this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22300%22 height=%22300%22><rect fill=%22%23000%22 width=%22300%22 height=%22300%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23FFF%22 font-family=%22monospace%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22>NO IMAGE</text></svg>';
    };
    
    renderTrackList();
    updateFavoritePlaylistButton();
    
    fullscreenOverlay.classList.add('active');
}

// Close fullscreen view
function closePlaylist() {
    fullscreenOverlay.classList.remove('active');
}

// Render track list in fullscreen view
function renderTrackList() {
    trackList.innerHTML = '';
    
    currentPlaylist.tracks.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        if (index === currentTrackIndex && currentPlaylist) {
            trackItem.classList.add('active');
        }
        trackItem.dataset.testid = `track-item-${index}`;
        
        trackItem.innerHTML = `
            <div class="track-number">${String(track.trackNumber).padStart(2, '0')}</div>
            <div class="track-info">
                <div class="track-name">${track.title}</div>
                <div class="track-artist">${track.artist}</div>
            </div>
            <div class="track-duration">--:--</div>
        `;
        
        trackItem.addEventListener('click', () => {
            currentTrackIndex = index;
            loadTrack();
            playTrack();
        });
        
        trackList.appendChild(trackItem);
    });
}

// Load track into audio player
function loadTrack() {
    if (!currentPlaylist) return;
    
    const track = currentPlaylist.tracks[currentTrackIndex];
    if (!track) return;
    
    audio.src = track.file;
    
    // Handle audio load errors
    audio.onerror = function() {
        showError(
            'AUDIO FILE NOT FOUND',
            `Cannot load: ${track.file}`,
            `HOW TO FIX:<br><br>1. Check that the file exists at:<br>   ${track.file}<br><br>2. Make sure the file path in script.js is correct<br><br>3. File paths are case-sensitive<br><br>4. Check folder structure:<br>   Playlists/<br>   └── ${currentPlaylist.id}/<br>       ├── cover.png<br>       └── ${track.file.split('/').pop()}<br><br>5. Edit the PLAYLISTS config in script.js to fix the path`
        );
    };
    
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    playerCover.src = currentPlaylist.coverArt;
    playerCover.onerror = function() {
        this.src = 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2264%22 height=%2264%22><rect fill=%22%23000%22 width=%2264%22 height=%2264%22/></svg>';
    };
    
    updateActiveTrack();
    updateFavoriteTrackButton();
}

// Play track
function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        playBtn.textContent = '❚❚';
    }).catch(err => {
        console.error('Error playing audio:', err);
    });
}

// Pause track
function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '►';
}

// Toggle play/pause
function togglePlay() {
    if (!currentPlaylist) {
        // Auto-load first playlist if none selected
        const firstPlaylistId = Object.keys(PLAYLISTS)[0];
        if (firstPlaylistId) {
            currentPlaylist = { id: firstPlaylistId, ...PLAYLISTS[firstPlaylistId] };
            currentPlaylist.tracks.sort((a, b) => a.trackNumber - b.trackNumber);
            currentTrackIndex = 0;
            loadTrack();
            playTrack();
        }
        return;
    }
    
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

// Previous track
function previousTrack() {
    if (!currentPlaylist) return;
    
    if (currentTrackIndex > 0) {
        currentTrackIndex--;
    } else {
        currentTrackIndex = currentPlaylist.tracks.length - 1;
    }
    
    loadTrack();
    if (isPlaying) playTrack();
}

// Next track
function nextTrack() {
    if (!currentPlaylist) return;
    
    if (currentTrackIndex < currentPlaylist.tracks.length - 1) {
        currentTrackIndex++;
    } else {
        currentTrackIndex = 0;
    }
    
    loadTrack();
    if (isPlaying) playTrack();
}

// Update active track highlighting
function updateActiveTrack() {
    const trackItems = trackList.querySelectorAll('.track-item');
    trackItems.forEach((item, index) => {
        if (index === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Toggle favorite track
function toggleFavoriteTrack() {
    if (!currentPlaylist) return;
    
    const track = currentPlaylist.tracks[currentTrackIndex];
    const trackId = `${currentPlaylist.id}-${currentTrackIndex}`;
    
    const index = favorites.tracks.findIndex(t => t.id === trackId);
    
    if (index > -1) {
        favorites.tracks.splice(index, 1);
    } else {
        favorites.tracks.push({
            id: trackId,
            playlistId: currentPlaylist.id,
            trackIndex: currentTrackIndex,
            title: track.title,
            artist: track.artist,
            coverArt: currentPlaylist.coverArt
        });
    }
    
    saveFavorites();
    updateFavoriteTrackButton();
    renderFavorites();
}

// Toggle favorite playlist
function toggleFavoritePlaylist() {
    if (!currentPlaylist) return;
    
    const index = favorites.playlists.indexOf(currentPlaylist.id);
    
    if (index > -1) {
        favorites.playlists.splice(index, 1);
    } else {
        favorites.playlists.push(currentPlaylist.id);
    }
    
    saveFavorites();
    updateFavoritePlaylistButton();
    renderPlaylists();
    renderFavorites();
}

// Update favorite track button state
function updateFavoriteTrackButton() {
    if (!currentPlaylist) return;
    
    const trackId = `${currentPlaylist.id}-${currentTrackIndex}`;
    const isFavorited = favorites.tracks.some(t => t.id === trackId);
    
    if (isFavorited) {
        favoriteTrackBtn.classList.add('favorited');
        favoriteTrackBtn.innerHTML = '<span class="heart">★</span>';
    } else {
        favoriteTrackBtn.classList.remove('favorited');
        favoriteTrackBtn.innerHTML = '<span class="heart">♡</span>';
    }
}

// Update favorite playlist button state
function updateFavoritePlaylistButton() {
    if (!currentPlaylist) return;
    
    const isFavorited = favorites.playlists.includes(currentPlaylist.id);
    
    if (isFavorited) {
        favoritePlaylistBtn.classList.add('favorited');
        favoritePlaylistBtn.innerHTML = '<span class="heart">★</span>';
    } else {
        favoritePlaylistBtn.classList.remove('favorited');
        favoritePlaylistBtn.innerHTML = '<span class="heart">♡</span>';
    }
}

// Render favorites tab
function renderFavorites() {
    favoritesGrid.innerHTML = '';
    
    // Randomize favorites order
    const shuffledPlaylists = [...favorites.playlists].sort(() => Math.random() - 0.5);
    const shuffledTracks = [...favorites.tracks].sort(() => Math.random() - 0.5);
    
    // Render favorite playlists
    shuffledPlaylists.forEach(playlistId => {
        const playlist = PLAYLISTS[playlistId];
        if (playlist) {
            const card = createPlaylistCard(playlistId, playlist);
            favoritesGrid.appendChild(card);
        }
    });
    
    // Render favorite tracks
    shuffledTracks.forEach(favTrack => {
        const playlist = PLAYLISTS[favTrack.playlistId];
        if (playlist) {
            const card = createTrackCard(favTrack, playlist);
            favoritesGrid.appendChild(card);
        }
    });
    
    // Show empty state if no favorites
    if (shuffledPlaylists.length === 0 && shuffledTracks.length === 0) {
        favoritesGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">NO FAVORITES YET<br><br>★ CLICK THE HEART TO<br>ADD FAVORITES ★</div>
            </div>
        `;
    }
}

// Create track card for favorites
function createTrackCard(favTrack, playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.dataset.testid = `favorite-track-${favTrack.id}`;
    
    card.innerHTML = `
        <div class="playlist-cover-wrapper">
            <img src="${favTrack.coverArt}" alt="${favTrack.title}" class="playlist-cover"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23000%22 width=%22200%22 height=%22200%22/></svg>'">
            <div class="favorite-indicator">♪</div>
        </div>
        <div class="playlist-info">
            <div class="playlist-name">${favTrack.title}</div>
            <div class="playlist-count">${favTrack.artist}</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        currentPlaylist = { id: favTrack.playlistId, ...playlist };
        currentPlaylist.tracks.sort((a, b) => a.trackNumber - b.trackNumber);
        currentTrackIndex = favTrack.trackIndex;
        loadTrack();
        playTrack();
    });
    
    return card;
}

// Update progress bar
function updateProgress() {
    const percent = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = percent + '%';
    
    currentTimeEl.textContent = formatTime(audio.currentTime);
    durationEl.textContent = formatTime(audio.duration);
}

// Format time in MM:SS
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Seek in track
function seek(e) {
    const rect = progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
}

// Switch tabs
function switchTab(tabName) {
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Player controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', previousTrack);
    nextBtn.addEventListener('click', nextTrack);
    favoriteTrackBtn.addEventListener('click', toggleFavoriteTrack);
    favoritePlaylistBtn.addEventListener('click', toggleFavoritePlaylist);
    
    // Progress bar
    progressContainer.addEventListener('click', seek);
    
    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('loadedmetadata', updateProgress);
    
    // Fullscreen controls
    closeBtn.addEventListener('click', closePlaylist);
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            togglePlay();
        } else if (e.code === 'ArrowLeft') {
            previousTrack();
        } else if (e.code === 'ArrowRight') {
            nextTrack();
        } else if (e.code === 'Escape' && fullscreenOverlay.classList.contains('active')) {
            closePlaylist();
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
