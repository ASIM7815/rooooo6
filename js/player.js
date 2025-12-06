// ===== VIDEO PLAYER STATE & VARIABLES =====
const video = document.getElementById('videoPlayer');
const playerContainer = document.getElementById('playerContainer');
const controlsContainer = document.getElementById('controlsContainer');
const headerOverlay = document.getElementById('headerOverlay');
const loadingSpinner = document.getElementById('loadingSpinner');

// Control elements
const playPauseBtn = document.getElementById('playPauseBtn');
const bigPlayBtn = document.getElementById('bigPlayBtn');
const progressBar = document.getElementById('progressBar');
const progressBarFill = document.getElementById('progressBarFill');
const progressBarHover = document.getElementById('progressBarHover');
const progressTooltip = document.getElementById('progressTooltip');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const backBtn = document.getElementById('backBtn');
const settingsBtn = document.getElementById('settingsBtn');
const ccBtn = document.getElementById('ccBtn');

// State variables
let controlsTimeout;
let isPlaying = false;
let isFullscreen = false;
let hideUI = false;

// ===== UTILITY FUNCTIONS =====
function formatTime(seconds) {
    if (!isFinite(seconds)) return '0:00';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function showControls() {
    controlsContainer.classList.remove('hide');
    headerOverlay.classList.remove('hide');
    playerContainer.style.cursor = 'default';
    
    clearTimeout(controlsTimeout);
    
    if (isPlaying && !hideUI) {
        controlsTimeout = setTimeout(() => {
            controlsContainer.classList.add('hide');
            headerOverlay.classList.add('hide');
            playerContainer.style.cursor = 'none';
        }, 3000);
    }
}

function hideControls() {
    if (isPlaying) {
        controlsContainer.classList.add('hide');
        headerOverlay.classList.add('hide');
        playerContainer.style.cursor = 'none';
    }
}

function updatePlayButton() {
    const playIcon = '<path fill="currentColor" d="M8 5v14l11-7z"/>';
    const pauseIcon = '<path fill="currentColor" d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>';
    
    playPauseBtn.querySelector('svg').innerHTML = isPlaying ? pauseIcon : playIcon;
    bigPlayBtn.querySelector('svg').innerHTML = playIcon;
    
    if (isPlaying) {
        bigPlayBtn.classList.add('hidden');
    } else {
        bigPlayBtn.classList.remove('hidden');
    }
}

// ===== PLAY/PAUSE FUNCTIONALITY =====
function togglePlay() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

video.addEventListener('play', () => {
    isPlaying = true;
    updatePlayButton();
    loadingSpinner.classList.remove('show');
});

video.addEventListener('pause', () => {
    isPlaying = false;
    updatePlayButton();
    showControls();
});

video.addEventListener('playing', () => {
    loadingSpinner.classList.remove('show');
});

video.addEventListener('waiting', () => {
    loadingSpinner.classList.add('show');
});

video.addEventListener('seeking', () => {
    loadingSpinner.classList.add('show');
});

video.addEventListener('seeked', () => {
    loadingSpinner.classList.remove('show');
});

// ===== TIME UPDATE & PROGRESS BAR =====
function updateProgress() {
    if (!video.duration) return;
    
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.value = percent;
    progressBarFill.style.width = percent + '%';
    currentTimeEl.textContent = formatTime(video.currentTime);
}

video.addEventListener('timeupdate', updateProgress);

video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
    progressBar.max = 100;
});

// Progress bar input
progressBar.addEventListener('input', (e) => {
    if (!video.duration) return;
    const percent = e.target.value / 100;
    video.currentTime = percent * video.duration;
});

// Progress bar hover preview
progressBar.addEventListener('mousemove', (e) => {
    if (!video.duration) return;
    
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const hoverTime = percent * video.duration;
    
    progressBarHover.style.width = (percent * 100) + '%';
    progressTooltip.textContent = formatTime(hoverTime);
    progressTooltip.style.left = (percent * 100) + '%';
});

// ===== VOLUME CONTROL =====
volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value / 100;
    updateVolumeIcon();
});

volumeBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    updateVolumeIcon();
});

function updateVolumeIcon() {
    const volumeHighIcon = '<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>';
    const volumeLowIcon = '<path fill="currentColor" d="M7 9v6h4l5 5V4l-5 5H7z"/>';
    const mutedIcon = '<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    
    let icon;
    if (video.muted) {
        icon = mutedIcon;
        volumeSlider.disabled = true;
        volumeSlider.style.opacity = '0.5';
    } else {
        volumeSlider.disabled = false;
        volumeSlider.style.opacity = '1';
        icon = video.volume < 0.5 ? volumeLowIcon : volumeHighIcon;
    }
    
    volumeBtn.querySelector('svg').innerHTML = icon;
}

// ===== FULLSCREEN =====
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen().catch(() => {
            // Fallback for browsers that don't support fullscreen API
            playerContainer.webkitRequestFullscreen?.();
        });
    } else {
        document.exitFullscreen().catch(() => {
            document.webkitExitFullscreen?.();
        });
    }
});

document.addEventListener('fullscreenchange', () => {
    isFullscreen = !!document.fullscreenElement;
    updateFullscreenButton();
});

document.addEventListener('webkitfullscreenchange', () => {
    isFullscreen = !!document.webkitFullscreenElement;
    updateFullscreenButton();
});

function updateFullscreenButton() {
    const enterIcon = '<path fill="currentColor" d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>';
    const exitIcon = '<path fill="currentColor" d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/>';
    fullscreenBtn.querySelector('svg').innerHTML = isFullscreen ? exitIcon : enterIcon;
}

// ===== BUTTON CONTROLS =====
playPauseBtn.addEventListener('click', togglePlay);
bigPlayBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

backBtn.addEventListener('click', () => {
    window.history.back();
});

settingsBtn.addEventListener('click', () => {
    console.log('Settings clicked');
    // Add settings panel functionality here
});

ccBtn.addEventListener('click', () => {
    console.log('Subtitles clicked');
    // Add subtitles functionality here
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.target === document.body) {
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                togglePlay();
                break;
            case 'ArrowLeft':
                video.currentTime = Math.max(0, video.currentTime - 5);
                showControls();
                break;
            case 'ArrowRight':
                video.currentTime = Math.min(video.duration, video.currentTime + 5);
                showControls();
                break;
            case 'KeyF':
                fullscreenBtn.click();
                break;
            case 'KeyM':
                volumeBtn.click();
                break;
            case 'ArrowUp':
                e.preventDefault();
                video.volume = Math.min(1, video.volume + 0.1);
                volumeSlider.value = video.volume * 100;
                showControls();
                break;
            case 'ArrowDown':
                e.preventDefault();
                video.volume = Math.max(0, video.volume - 0.1);
                volumeSlider.value = video.volume * 100;
                showControls();
                break;
            case 'KeyJ':
                video.currentTime = Math.max(0, video.currentTime - 10);
                showControls();
                break;
            case 'KeyL':
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                showControls();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                if (video.duration) {
                    const percent = parseInt(e.code.slice(-1)) / 10;
                    video.currentTime = percent * video.duration;
                    showControls();
                }
                break;
            case 'Escape':
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
                break;
        }
    }
});

// ===== MOUSE/TOUCH CONTROLS =====
playerContainer.addEventListener('mousemove', showControls);
playerContainer.addEventListener('mouseleave', hideControls);
playerContainer.addEventListener('touchstart', showControls);
playerContainer.addEventListener('touchmove', showControls);

// Double-click for fullscreen
playerContainer.addEventListener('dblclick', () => {
    fullscreenBtn.click();
});

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    updatePlayButton();
    updateVolumeIcon();
    updateFullscreenButton();
    
    // Set initial volume
    video.volume = 0.8;
    volumeSlider.value = 80;
    
    // Show controls on load
    showControls();
    
    // Auto-hide controls after 3 seconds if playing
    setTimeout(() => {
        if (isPlaying) {
            hideControls();
        }
    }, 3000);
});

// Handle video end
video.addEventListener('ended', () => {
    isPlaying = false;
    updatePlayButton();
    showControls();
});
});

document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case ' ':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            video.currentTime -= 5;
            break;
        case 'ArrowRight':
            video.currentTime += 5;
            break;
        case 'ArrowUp':
            video.volume = Math.min(1, video.volume + 0.1);
            volumeSlider.value = video.volume * 100;
            break;
        case 'ArrowDown':
            video.volume = Math.max(0, video.volume - 0.1);
            volumeSlider.value = video.volume * 100;
            break;
        case 'f':
            fullscreenBtn.click();
            break;
        case 'm':
            volumeBtn.click();
            break;
    }
});

loadingSpinner.classList.add('show');
showControls();
