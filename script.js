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
                trackNumber: 2
            },
            {
                 file:"Playlists/Alternate/The-Times-We-Spent-Together.mp3",
                 title: "The Times We Spent Together",
                 artist: "Vesluna",
                 trackNumber: 3
             },
            {
                 file:"Playlists/Alternate/True-Colors.mp3",
                 title: "True Colors",
                 artist: "Vesluna",
                 trackNumber: 4
             },
            {
                 file:"Playlists/Alternate/Alternate.mp3",
                 title: "Alternate",
                 artist: "Vesluna",
                 trackNumber: 1
             },
            {
                 file:"Playlists/Alternate/Blessing.mp3",
                 title: "-... .-.. . ... ... .. -. --.",
                 artist: "Vesluna",
                 trackNumber: 5
             },
            {
                 file:"Playlists/Alternate/Stargaze.mp3",
                 title: "Stargaze",
                 artist: "Vesluna",
                 trackNumber: 6
             },
        ]
    },
     Roses: {
     name: "ROSES",
     coverArt: "Playlists/Roses/cover.png",
     tracks: [
      { 
      file: "Playlists/Roses/Crimson-Violin-†.mp3",
      title: "Crimson Violin †",
      artist: "Vesluna",
      trackNumber: 2
     },
      { 
      file: "Playlists/Roses/Roses.mp3",
      title: "Roses",
      artist: "Vesluna",
      trackNumber: 1
     }
   ]
},
     HALLOWEEN2025: {
     name: "HALLOWEEN 2025",
     coverArt: "Playlists/Halloween2025/cover.png",
     tracks: [
      { 
      file: "Playlists/Halloween2025/Silent-Cleaver.mp3",
      title: "Silent Cleaver",
      artist: "Vesluna",
      trackNumber: 1
     }

]
 }  // Duplicate from selecting from here
};
// ============================================

// State Management
let currentPlaylist = null;
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 'off'; // 'off', 'all', 'one'
let currentVolume = 1.0;
let isMuted = false;
let shuffledIndexes = [];
let favorites = {
    playlists: [],
    tracks: []
};
let recentTracks = [];
let playlistStats = {};
let playlistCustomization = {};
let playlistNotes = {};
let isDarkMode = false;
let searchQuery = '';
let sortMode = 'default';
let crossfadeDuration = 0;
let nextAudio = null;
let currentAudioPlayer = 1;

// DOM Elements
const audio = document.getElementById('audio-player');
const audio2 = document.getElementById('audio-player-2');
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const progressHoverIndicator = document.getElementById('progress-hover-indicator');
const progressTooltip = document.getElementById('progress-tooltip');
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
const recentTracksGrid = document.getElementById('recent-tracks-grid');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const volumeBtn = document.getElementById('volume-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');
const equalizer = document.getElementById('equalizer');
const settingsBtn = document.getElementById('settings-btn');
const settingsMenu = document.getElementById('settings-menu');
const exportBtn = document.getElementById('export-favorites');
const importBtn = document.getElementById('import-favorites');
const importFileInput = document.getElementById('import-file-input');
const showShortcutsBtn = document.getElementById('show-shortcuts');
const shortcutsHint = document.getElementById('shortcuts-hint');
const shortcutsClose = document.getElementById('shortcuts-close');
const toast = document.getElementById('toast');
const statTracks = document.getElementById('stat-tracks');
const statDuration = document.getElementById('stat-duration');
const statPlays = document.getElementById('stat-plays');
const colorSwatches = document.querySelectorAll('.color-swatch');
const styleButtons = document.querySelectorAll('.style-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const playlistNotesTextarea = document.getElementById('playlist-notes');
const notesSaveBtn = document.getElementById('notes-save-btn');
const crossfadeSlider = document.getElementById('crossfade-slider');
const crossfadeValue = document.getElementById('crossfade-value');

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

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 2000);
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
    loadRecentTracks();
    loadPlaylistStats();
    loadPlaylistCustomization();
    loadPlaylistNotes();
    loadTheme();
    loadCrossfade();
    renderPlaylists();
    renderFavorites();
    renderRecentTracks();
    setupEventListeners();
    
    // Show keyboard shortcuts on first visit
    if (!localStorage.getItem('shortcuts-seen')) {
        setTimeout(() => {
            shortcutsHint.classList.add('visible');
        }, 1000);
    }
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

// Load recent tracks
function loadRecentTracks() {
    const stored = localStorage.getItem('recent-tracks');
    if (stored) {
        try {
            recentTracks = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading recent tracks:', e);
            recentTracks = [];
        }
    }
}

// Save recent tracks
function saveRecentTracks() {
    localStorage.setItem('recent-tracks', JSON.stringify(recentTracks));
}

// Add track to recent
function addToRecent(track, playlistId, coverArt) {
    const recentTrack = {
        id: `${playlistId}-${currentTrackIndex}`,
        playlistId,
        trackIndex: currentTrackIndex,
        title: track.title,
        artist: track.artist,
        coverArt,
        playedAt: Date.now()
    };
    
    // Remove if already exists
    recentTracks = recentTracks.filter(t => t.id !== recentTrack.id);
    
    // Add to beginning
    recentTracks.unshift(recentTrack);
    
    // Keep only last 20
    if (recentTracks.length > 20) {
        recentTracks = recentTracks.slice(0, 20);
    }
    
    saveRecentTracks();
    renderRecentTracks();
}

// Load playlist stats
function loadPlaylistStats() {
    const stored = localStorage.getItem('playlist-stats');
    if (stored) {
        try {
            playlistStats = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading playlist stats:', e);
            playlistStats = {};
        }
    }
}

// Save playlist stats
function savePlaylistStats() {
    localStorage.setItem('playlist-stats', JSON.stringify(playlistStats));
}

// Increment playlist play count
function incrementPlayCount(playlistId) {
    if (!playlistStats[playlistId]) {
        playlistStats[playlistId] = { plays: 0 };
    }
    playlistStats[playlistId].plays++;
    savePlaylistStats();
    updateStats();
}

// Load playlist customization
function loadPlaylistCustomization() {
    const stored = localStorage.getItem('playlist-customization');
    if (stored) {
        try {
            playlistCustomization = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading customization:', e);
            playlistCustomization = {};
        }
    }
}

// Save playlist customization
function savePlaylistCustomization() {
    localStorage.setItem('playlist-customization', JSON.stringify(playlistCustomization));
}

// Load playlist notes
function loadPlaylistNotes() {
    const stored = localStorage.getItem('playlist-notes');
    if (stored) {
        try {
            playlistNotes = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading notes:', e);
            playlistNotes = {};
        }
    }
}

// Save playlist notes
function savePlaylistNotes() {
    localStorage.setItem('playlist-notes', JSON.stringify(playlistNotes));
}

// Load theme preference
function loadTheme() {
    const stored = localStorage.getItem('dark-mode');
    if (stored === 'true') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
    }
}

// Toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        showToast('DARK MODE ON');
    } else {
        document.body.classList.remove('dark-mode');
        showToast('DARK MODE OFF');
    }
    localStorage.setItem('dark-mode', isDarkMode);
}

// Load crossfade setting
function loadCrossfade() {
    const stored = localStorage.getItem('crossfade-duration');
    if (stored) {
        crossfadeDuration = parseInt(stored);
        crossfadeSlider.value = crossfadeDuration;
        crossfadeValue.textContent = crossfadeDuration;
    }
}

// Update crossfade
function updateCrossfade(value) {
    crossfadeDuration = parseInt(value);
    crossfadeValue.textContent = crossfadeDuration;
    localStorage.setItem('crossfade-duration', crossfadeDuration);
}

// Apply playlist customization
function applyCustomization(playlistId) {
    const custom = playlistCustomization[playlistId];
    if (custom) {
        // Apply to fullscreen cover
        fullscreenCover.style.borderColor = custom.color || '#000000';
        fullscreenCover.style.borderStyle = custom.style || 'solid';
        
        // Update color swatch selection
        colorSwatches.forEach(swatch => {
            if (swatch.dataset.color === custom.color) {
                swatch.classList.add('active');
            } else {
                swatch.classList.remove('active');
            }
        });
        
        // Update style button selection
        styleButtons.forEach(btn => {
            if (btn.dataset.style === custom.style) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } else {
        // Reset to defaults
        fullscreenCover.style.borderColor = '#000000';
        fullscreenCover.style.borderStyle = 'solid';
        colorSwatches[0].classList.add('active');
        styleButtons[0].classList.add('active');
    }
}

// Render playlists grid
function renderPlaylists() {
    playlistGrid.innerHTML = '';
    
    let playlists = Object.entries(PLAYLISTS);
    
    // Apply sorting
    playlists = sortPlaylists(playlists);
    
    // Apply search filter
    if (searchQuery) {
        playlists = playlists.filter(([id, playlist]) => {
            const nameMatch = playlist.name.toLowerCase().includes(searchQuery.toLowerCase());
            const trackMatch = playlist.tracks.some(track => 
                track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                track.artist.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return nameMatch || trackMatch;
        });
    }
    
    playlists.forEach(([id, playlist]) => {
        const card = createPlaylistCard(id, playlist);
        playlistGrid.appendChild(card);
    });
    
    // Show empty state if no results
    if (playlists.length === 0) {
        playlistGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">NO RESULTS FOUND<br><br>TRY A DIFFERENT<br>SEARCH TERM</div>
            </div>
        `;
    }
}

// Sort playlists
function sortPlaylists(playlists) {
    switch(sortMode) {
        case 'name-asc':
            return playlists.sort(([, a], [, b]) => a.name.localeCompare(b.name));
        case 'name-desc':
            return playlists.sort(([, a], [, b]) => b.name.localeCompare(a.name));
        case 'tracks-asc':
            return playlists.sort(([, a], [, b]) => a.tracks.length - b.tracks.length);
        case 'tracks-desc':
            return playlists.sort(([, a], [, b]) => b.tracks.length - a.tracks.length);
        case 'recent':
            return playlists.sort(([idA], [idB]) => {
                const statsA = playlistStats[idA] || { plays: 0 };
                const statsB = playlistStats[idB] || { plays: 0 };
                return statsB.plays - statsA.plays;
            });
        default:
            return playlists;
    }
}

// Create playlist card
function createPlaylistCard(id, playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.dataset.testid = `playlist-card-${id}`;
    
    const isFavorited = favorites.playlists.includes(id);
    const custom = playlistCustomization[id];
    
    // Apply customization
    if (custom) {
        card.style.borderColor = custom.color || '#000000';
        card.style.borderStyle = custom.style || 'solid';
    }
    
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
    
    // Load notes for this playlist
    playlistNotesTextarea.value = playlistNotes[id] || '';
    
    renderTrackList();
    updateFavoritePlaylistButton();
    applyCustomization(id);
    updateStats();
    
    fullscreenOverlay.classList.add('active');
}

// Close fullscreen view
function closePlaylist() {
    fullscreenOverlay.classList.remove('active');
}

// Update stats display
function updateStats() {
    if (!currentPlaylist) return;
    
    const stats = playlistStats[currentPlaylist.id] || { plays: 0 };
    
    statTracks.textContent = currentPlaylist.tracks.length;
    statPlays.textContent = stats.plays;
    
    // Calculate total duration (placeholder since we don't have actual durations)
    // In a real app, you'd load this from the audio metadata
    const estimatedDuration = currentPlaylist.tracks.length * 3; // 3 min average
    statDuration.textContent = formatTime(estimatedDuration * 60);
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

// Create shuffled order
function createShuffleOrder() {
    if (!currentPlaylist) return;
    
    shuffledIndexes = [...Array(currentPlaylist.tracks.length).keys()];
    
    // Fisher-Yates shuffle
    for (let i = shuffledIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledIndexes[i], shuffledIndexes[j]] = [shuffledIndexes[j], shuffledIndexes[i]];
    }
}

// Get actual track index (accounting for shuffle)
function getActualIndex(index) {
    if (isShuffle && shuffledIndexes.length > 0) {
        return shuffledIndexes[index];
    }
    return index;
}

// Load track into audio player
function loadTrack() {
    if (!currentPlaylist) return;
    
    const actualIndex = getActualIndex(currentTrackIndex);
    const track = currentPlaylist.tracks[actualIndex];
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
    addToRecent(track, currentPlaylist.id, currentPlaylist.coverArt);
    incrementPlayCount(currentPlaylist.id);
}

// Play track
function playTrack() {
    audio.play().then(() => {
        isPlaying = true;
        playBtn.textContent = '❚❚';
        equalizer.classList.add('active');
    }).catch(err => {
        console.error('Error playing audio:', err);
    });
}

// Pause track
function pauseTrack() {
    audio.pause();
    isPlaying = false;
    playBtn.textContent = '►';
    equalizer.classList.remove('active');
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
            if (isShuffle) createShuffleOrder();
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

// Toggle shuffle
function toggleShuffle() {
    isShuffle = !isShuffle;
    
    if (isShuffle) {
        shuffleBtn.classList.add('active');
        createShuffleOrder();
        showToast('SHUFFLE ON');
    } else {
        shuffleBtn.classList.remove('active');
        shuffledIndexes = [];
        showToast('SHUFFLE OFF');
    }
}

// Toggle repeat
function toggleRepeat() {
    if (repeatMode === 'off') {
        repeatMode = 'all';
        repeatBtn.textContent = '↻';
        repeatBtn.classList.add('active');
        showToast('REPEAT ALL');
    } else if (repeatMode === 'all') {
        repeatMode = 'one';
        repeatBtn.textContent = '↻₁';
        showToast('REPEAT ONE');
    } else {
        repeatMode = 'off';
        repeatBtn.textContent = '↻';
        repeatBtn.classList.remove('active');
        showToast('REPEAT OFF');
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
    
    if (repeatMode === 'one') {
        // Repeat current track
        audio.currentTime = 0;
        if (isPlaying) playTrack();
        return;
    }
    
    if (currentTrackIndex < currentPlaylist.tracks.length - 1) {
        currentTrackIndex++;
    } else {
        if (repeatMode === 'all') {
            currentTrackIndex = 0;
        } else {
            // Stop at end
            pauseTrack();
            return;
        }
    }
    
    loadTrack();
    if (isPlaying) playTrack();
}

// Crossfade to next track
function crossfadeToNextTrack() {
    if (!currentPlaylist || crossfadeDuration === 0) {
        nextTrack();
        return;
    }
    
    // Get next track index
    let nextIndex = currentTrackIndex;
    if (repeatMode === 'one') {
        // Stay on same track
    } else if (currentTrackIndex < currentPlaylist.tracks.length - 1) {
        nextIndex = currentTrackIndex + 1;
    } else if (repeatMode === 'all') {
        nextIndex = 0;
    } else {
        // End of playlist
        pauseTrack();
        return;
    }
    
    // Prepare next audio
    const nextActualIndex = isShuffle && shuffledIndexes.length > 0 ? shuffledIndexes[nextIndex] : nextIndex;
    const nextTrackData = currentPlaylist.tracks[nextActualIndex];
    if (!nextTrackData) return;
    
    const nextPlayer = currentAudioPlayer === 1 ? audio2 : audio;
    const currentPlayer = currentAudioPlayer === 1 ? audio : audio2;
    
    nextPlayer.src = nextTrackData.file;
    nextPlayer.volume = 0;
    
    // Start next track
    nextPlayer.play().then(() => {
        const fadeSteps = 20;
        const fadeInterval = (crossfadeDuration * 1000) / fadeSteps;
        let step = 0;
        
        const fadeTimer = setInterval(() => {
            step++;
            const progress = step / fadeSteps;
            
            // Fade out current, fade in next
            currentPlayer.volume = Math.max(0, currentVolume * (1 - progress));
            nextPlayer.volume = Math.min(currentVolume, currentVolume * progress);
            
            if (step >= fadeSteps) {
                clearInterval(fadeTimer);
                currentPlayer.pause();
                currentPlayer.currentTime = 0;
                currentPlayer.volume = currentVolume;
                
                // Switch active player
                currentAudioPlayer = currentAudioPlayer === 1 ? 2 : 1;
                currentTrackIndex = nextIndex;
                
                // Update UI
                playerTitle.textContent = nextTrackData.title;
                playerArtist.textContent = nextTrackData.artist;
                updateActiveTrack();
                updateFavoriteTrackButton();
                addToRecent(nextTrackData, currentPlaylist.id, currentPlaylist.coverArt);
                incrementPlayCount(currentPlaylist.id);
            }
        }, fadeInterval);
    });
}

// Update active track highlighting
function updateActiveTrack() {
    const trackItems = trackList.querySelectorAll('.track-item');
    const actualIndex = getActualIndex(currentTrackIndex);
    
    trackItems.forEach((item, index) => {
        if (index === actualIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Toggle favorite track
function toggleFavoriteTrack() {
    if (!currentPlaylist) return;
    
    const actualIndex = getActualIndex(currentTrackIndex);
    const track = currentPlaylist.tracks[actualIndex];
    const trackId = `${currentPlaylist.id}-${actualIndex}`;
    
    const index = favorites.tracks.findIndex(t => t.id === trackId);
    
    if (index > -1) {
        favorites.tracks.splice(index, 1);
    } else {
        favorites.tracks.push({
            id: trackId,
            playlistId: currentPlaylist.id,
            trackIndex: actualIndex,
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
    
    const actualIndex = getActualIndex(currentTrackIndex);
    const trackId = `${currentPlaylist.id}-${actualIndex}`;
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

// Render recent tracks
function renderRecentTracks() {
    recentTracksGrid.innerHTML = '';
    
    if (recentTracks.length === 0) {
        recentTracksGrid.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-text">NO RECENT TRACKS<br><br>♪ START PLAYING TO<br>SEE HISTORY ♪</div>
            </div>
        `;
        return;
    }
    
    recentTracks.forEach(recentTrack => {
        const playlist = PLAYLISTS[recentTrack.playlistId];
        if (playlist) {
            const card = createRecentTrackCard(recentTrack, playlist);
            recentTracksGrid.appendChild(card);
        }
    });
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
        if (isShuffle) createShuffleOrder();
        loadTrack();
        playTrack();
    });
    
    return card;
}

// Create recent track card
function createRecentTrackCard(recentTrack, playlist) {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.dataset.testid = `recent-track-${recentTrack.id}`;
    
    card.innerHTML = `
        <div class="playlist-cover-wrapper">
            <img src="${recentTrack.coverArt}" alt="${recentTrack.title}" class="playlist-cover"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22><rect fill=%22%23000%22 width=%22200%22 height=%22200%22/></svg>'">
        </div>
        <div class="playlist-info">
            <div class="playlist-name">${recentTrack.title}</div>
            <div class="playlist-count">${recentTrack.artist}</div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        currentPlaylist = { id: recentTrack.playlistId, ...playlist };
        currentPlaylist.tracks.sort((a, b) => a.trackNumber - b.trackNumber);
        currentTrackIndex = recentTrack.trackIndex;
        if (isShuffle) createShuffleOrder();
        loadTrack();
        playTrack();
    });
    
    return card;
}

// Update progress bar
function updateProgress() {
    const activePlayer = currentAudioPlayer === 1 ? audio : audio2;
    const percent = (activePlayer.currentTime / activePlayer.duration) * 100;
    progressBar.style.width = percent + '%';
    
    currentTimeEl.textContent = formatTime(activePlayer.currentTime);
    durationEl.textContent = formatTime(activePlayer.duration);
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
    const activePlayer = currentAudioPlayer === 1 ? audio : audio2;
    const rect = progressContainer.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    activePlayer.currentTime = percent * activePlayer.duration;
}

// Update progress hover indicator
function updateProgressHover(e) {
    const activePlayer = currentAudioPlayer === 1 ? audio : audio2;
    const rect = progressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = x / rect.width;
    
    progressHoverIndicator.style.left = x + 'px';
    progressTooltip.style.left = x + 'px';
    
    const time = percent * activePlayer.duration;
    progressTooltip.textContent = formatTime(time);
}

// Volume control
function updateVolume(value) {
    currentVolume = value / 100;
    audio.volume = currentVolume;
    audio2.volume = currentVolume;
    updateVolumeIcon();
}

function toggleMute() {
    isMuted = !isMuted;
    
    if (isMuted) {
        audio.volume = 0;
        audio2.volume = 0;
        updateVolumeIcon();
    } else {
        audio.volume = currentVolume;
        audio2.volume = currentVolume;
        updateVolumeIcon();
    }
}

function updateVolumeIcon() {
    const volume = isMuted ? 0 : currentVolume;
    
    if (volume === 0) {
        volumeIcon.textContent = '(-_-)';
    } else if (volume < 0.5) {
        volumeIcon.textContent = '))';
    } else {
        volumeIcon.textContent = '))))';
    }
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

// Export favorites
function exportFavorites() {
    const data = {
        favorites,
        recentTracks,
        playlistStats,
        playlistCustomization,
        playlistNotes,
        darkMode: isDarkMode,
        crossfadeDuration,
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `playlists-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('FAVORITES EXPORTED!');
    settingsMenu.classList.remove('visible');
}

// Import favorites
function importFavorites() {
    importFileInput.click();
}

function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (data.favorites) favorites = data.favorites;
            if (data.recentTracks) recentTracks = data.recentTracks;
            if (data.playlistStats) playlistStats = data.playlistStats;
            if (data.playlistCustomization) playlistCustomization = data.playlistCustomization;
            if (data.playlistNotes) playlistNotes = data.playlistNotes;
            if (data.darkMode !== undefined) {
                isDarkMode = data.darkMode;
                document.body.classList.toggle('dark-mode', isDarkMode);
                localStorage.setItem('dark-mode', isDarkMode);
            }
            if (data.crossfadeDuration !== undefined) {
                crossfadeDuration = data.crossfadeDuration;
                crossfadeSlider.value = crossfadeDuration;
                crossfadeValue.textContent = crossfadeDuration;
                localStorage.setItem('crossfade-duration', crossfadeDuration);
            }
            
            saveFavorites();
            saveRecentTracks();
            savePlaylistStats();
            savePlaylistCustomization();
            savePlaylistNotes();
            
            renderPlaylists();
            renderFavorites();
            renderRecentTracks();
            
            showToast('DATA IMPORTED!');
            settingsMenu.classList.remove('visible');
        } catch (error) {
            showToast('IMPORT FAILED!');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
}

// Setup event listeners
function setupEventListeners() {
    // Player controls
    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', previousTrack);
    nextBtn.addEventListener('click', nextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    favoriteTrackBtn.addEventListener('click', toggleFavoriteTrack);
    favoritePlaylistBtn.addEventListener('click', toggleFavoritePlaylist);
    
    // Volume controls
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', (e) => updateVolume(e.target.value));
    
    // Progress bar
    progressContainer.addEventListener('click', seek);
    progressContainer.addEventListener('mousemove', updateProgressHover);
    
    // Audio events
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
        if (crossfadeDuration > 0) {
            crossfadeToNextTrack();
        } else {
            nextTrack();
        }
    });
    audio.addEventListener('loadedmetadata', updateProgress);
    
    // Handle crossfade trigger before track ends
    audio.addEventListener('timeupdate', () => {
        if (crossfadeDuration > 0 && audio.duration - audio.currentTime <= crossfadeDuration && !nextAudio) {
            nextAudio = true;
            setTimeout(() => {
                crossfadeToNextTrack();
            }, (audio.duration - audio.currentTime - crossfadeDuration) * 1000);
        }
    });
    
    // Audio2 events for crossfade
    audio2.addEventListener('timeupdate', () => {
        if (currentAudioPlayer === 2) {
            updateProgress();
        }
    });
    audio2.addEventListener('ended', () => {
        if (currentAudioPlayer === 2) {
            if (crossfadeDuration > 0) {
                crossfadeToNextTrack();
            } else {
                nextTrack();
            }
        }
    });
    
    // Fullscreen controls
    closeBtn.addEventListener('click', closePlaylist);
    
    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Settings
    settingsBtn.addEventListener('click', () => {
        settingsMenu.classList.toggle('visible');
    });
    
    exportBtn.addEventListener('click', exportFavorites);
    importBtn.addEventListener('click', importFavorites);
    importFileInput.addEventListener('change', handleImportFile);
    
    showShortcutsBtn.addEventListener('click', () => {
        shortcutsHint.classList.add('visible');
        settingsMenu.classList.remove('visible');
    });
    
    shortcutsClose.addEventListener('click', () => {
        shortcutsHint.classList.remove('visible');
        localStorage.setItem('shortcuts-seen', 'true');
    });
    
    // Close menus when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsMenu.contains(e.target) && !settingsBtn.contains(e.target)) {
            settingsMenu.classList.remove('visible');
        }
    });
    
    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleDarkMode);
    
    // Search
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderPlaylists();
        renderFavorites();
    });
    
    // Sort
    sortSelect.addEventListener('change', (e) => {
        sortMode = e.target.value;
        renderPlaylists();
    });
    
    // Playlist notes
    notesSaveBtn.addEventListener('click', () => {
        if (!currentPlaylist) return;
        playlistNotes[currentPlaylist.id] = playlistNotesTextarea.value;
        savePlaylistNotes();
        showToast('NOTES SAVED!');
    });
    
    // Crossfade
    crossfadeSlider.addEventListener('input', (e) => {
        updateCrossfade(e.target.value);
    });
    
    // Playlist customization
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', () => {
            if (!currentPlaylist) return;
            
            const color = swatch.dataset.color;
            
            if (!playlistCustomization[currentPlaylist.id]) {
                playlistCustomization[currentPlaylist.id] = {};
            }
            playlistCustomization[currentPlaylist.id].color = color;
            
            fullscreenCover.style.borderColor = color;
            
            colorSwatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            
            savePlaylistCustomization();
            renderPlaylists();
            showToast('COLOR UPDATED!');
        });
    });
    
    styleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!currentPlaylist) return;
            
            const style = btn.dataset.style;
            
            if (!playlistCustomization[currentPlaylist.id]) {
                playlistCustomization[currentPlaylist.id] = {};
            }
            playlistCustomization[currentPlaylist.id].style = style;
            
            fullscreenCover.style.borderStyle = style;
            
            styleButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            savePlaylistCustomization();
            renderPlaylists();
            showToast('STYLE UPDATED!');
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if typing in input
        if (e.target.tagName === 'INPUT') return;
        
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                previousTrack();
                break;
            case 'ArrowRight':
                e.preventDefault();
                nextTrack();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const newVol = Math.min(100, parseInt(volumeSlider.value) + 10);
                volumeSlider.value = newVol;
                updateVolume(newVol);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const newVolDown = Math.max(0, parseInt(volumeSlider.value) - 10);
                volumeSlider.value = newVolDown;
                updateVolume(newVolDown);
                break;
            case 'KeyM':
                toggleMute();
                break;
            case 'KeyS':
                toggleShuffle();
                break;
            case 'KeyR':
                toggleRepeat();
                break;
            case 'Escape':
                if (fullscreenOverlay.classList.contains('active')) {
                    closePlaylist();
                }
                if (shortcutsHint.classList.contains('visible')) {
                    shortcutsHint.classList.remove('visible');
                }
                break;
            case 'KeyD':
                toggleDarkMode();
                break;
            case 'Slash':
                e.preventDefault();
                searchInput.focus();
                break;
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
