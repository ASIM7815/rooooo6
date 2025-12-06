// ===== VIDEO PLAYER CONTROLS =====
const video = document.getElementById('mainVideo');
const videoControls = document.getElementById('videoControls');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressFilled = document.getElementById('progressFilled');
const progressHandle = document.getElementById('progressHandle');
const currentTimeDisplay = document.getElementById('currentTime');
const durationDisplay = document.getElementById('duration');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const nextEpisodeBtn = document.getElementById('nextEpisodeBtn');

let controlsTimeout;
let isPlaying = false;

// ===== PLAY/PAUSE FUNCTIONALITY =====
function togglePlayPause() {
    if (video.paused) {
        video.play();
        isPlaying = true;
        document.querySelector('.icon-play').classList.add('hidden');
        document.querySelector('.icon-pause').classList.remove('hidden');
    } else {
        video.pause();
        isPlaying = false;
        document.querySelector('.icon-play').classList.remove('hidden');
        document.querySelector('.icon-pause').classList.add('hidden');
    }
}

playPauseBtn.addEventListener('click', togglePlayPause);

// Click on video to play/pause
video.addEventListener('click', togglePlayPause);

// Spacebar to play/pause
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
        e.preventDefault();
        togglePlayPause();
    }
});

// ===== REWIND & FORWARD =====
rewindBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 10);
    showRewindIndicator();
});

forwardBtn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 10);
    showForwardIndicator();
});

// Arrow keys for rewind/forward
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        video.currentTime = Math.max(0, video.currentTime - 10);
        showRewindIndicator();
    } else if (e.key === 'ArrowRight') {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
        showForwardIndicator();
    }
});

function showRewindIndicator() {
    showTemporaryIndicator('⏪ 10s');
}

function showForwardIndicator() {
    showTemporaryIndicator('10s ⏩');
}

function showTemporaryIndicator(text) {
    const indicator = document.createElement('div');
    indicator.textContent = text;
    indicator.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 20px 40px;
        border-radius: 10px;
        font-size: 24px;
        font-weight: 700;
        z-index: 1000;
        pointer-events: none;
    `;
    
    document.querySelector('.video-container').appendChild(indicator);
    
    setTimeout(() => {
        indicator.remove();
    }, 500);
}

// ===== VOLUME CONTROL =====
let previousVolume = 1;

volumeBtn.addEventListener('click', () => {
    if (video.muted || video.volume === 0) {
        video.muted = false;
        video.volume = previousVolume;
        volumeSlider.value = previousVolume * 100;
        document.querySelector('.icon-volume').classList.remove('hidden');
        document.querySelector('.icon-mute').classList.add('hidden');
    } else {
        previousVolume = video.volume;
        video.muted = true;
        document.querySelector('.icon-volume').classList.add('hidden');
        document.querySelector('.icon-mute').classList.remove('hidden');
    }
});

volumeSlider.addEventListener('input', (e) => {
    const volume = e.target.value / 100;
    video.volume = volume;
    video.muted = volume === 0;
    
    if (volume === 0) {
        document.querySelector('.icon-volume').classList.add('hidden');
        document.querySelector('.icon-mute').classList.remove('hidden');
    } else {
        document.querySelector('.icon-volume').classList.remove('hidden');
        document.querySelector('.icon-mute').classList.add('hidden');
    }
});

// Arrow up/down for volume
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        video.volume = Math.min(1, video.volume + 0.1);
        volumeSlider.value = video.volume * 100;
        video.muted = false;
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        video.volume = Math.max(0, video.volume - 0.1);
        volumeSlider.value = video.volume * 100;
    }
});

// M key to mute
document.addEventListener('keydown', (e) => {
    if (e.key === 'm' || e.key === 'M') {
        volumeBtn.click();
    }
});

// ===== PROGRESS BAR =====
video.addEventListener('timeupdate', () => {
    const progress = (video.currentTime / video.duration) * 100;
    progressFilled.style.width = progress + '%';
    progressHandle.style.left = progress + '%';
    
    currentTimeDisplay.textContent = formatTime(video.currentTime);
});

video.addEventListener('loadedmetadata', () => {
    durationDisplay.textContent = formatTime(video.duration);
});

// Click on progress bar to seek
const progressBar = document.querySelector('.progress-bar-watch');
progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * video.duration;
});

// Drag progress handle
let isDragging = false;

progressHandle.addEventListener('mousedown', (e) => {
    isDragging = true;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = progressBar.getBoundingClientRect();
        let pos = (e.clientX - rect.left) / rect.width;
        pos = Math.max(0, Math.min(1, pos));
        video.currentTime = pos * video.duration;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// ===== TIME FORMATTING =====
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ===== FULLSCREEN =====
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.querySelector('.video-container').requestFullscreen();
        document.querySelector('.icon-fullscreen').classList.add('hidden');
        document.querySelector('.icon-exit-fullscreen').classList.remove('hidden');
    } else {
        document.exitFullscreen();
        document.querySelector('.icon-fullscreen').classList.remove('hidden');
        document.querySelector('.icon-exit-fullscreen').classList.add('hidden');
    }
});

// F key for fullscreen
document.addEventListener('keydown', (e) => {
    if (e.key === 'f' || e.key === 'F') {
        fullscreenBtn.click();
    }
});

// Detect fullscreen changes
document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.querySelector('.icon-fullscreen').classList.remove('hidden');
        document.querySelector('.icon-exit-fullscreen').classList.add('hidden');
    }
});

// ===== CONTROLS AUTO-HIDE =====
function showControls() {
    videoControls.classList.add('active');
    document.querySelector('.video-container').style.cursor = 'default';
    
    clearTimeout(controlsTimeout);
    
    if (isPlaying) {
        controlsTimeout = setTimeout(() => {
            videoControls.classList.remove('active');
            document.querySelector('.video-container').style.cursor = 'none';
        }, 3000);
    }
}

document.querySelector('.video-container').addEventListener('mousemove', showControls);
document.querySelector('.video-container').addEventListener('mouseenter', showControls);

video.addEventListener('play', () => {
    controlsTimeout = setTimeout(() => {
        videoControls.classList.remove('active');
        document.querySelector('.video-container').style.cursor = 'none';
    }, 3000);
});

video.addEventListener('pause', () => {
    clearTimeout(controlsTimeout);
    videoControls.classList.add('active');
    document.querySelector('.video-container').style.cursor = 'default';
});

// ===== NEXT EPISODE =====
nextEpisodeBtn.addEventListener('click', () => {
    // This would load the next episode
    showNotification('Loading next episode...');
    
    // Simulate loading next episode
    setTimeout(() => {
        video.currentTime = 0;
        video.play();
    }, 1000);
});

// Auto-play next episode when current ends
video.addEventListener('ended', () => {
    showNextEpisodeCountdown();
});

function showNextEpisodeCountdown() {
    const countdown = document.createElement('div');
    countdown.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.95);
        padding: 40px;
        border-radius: 10px;
        text-align: center;
        z-index: 1002;
    `;
    
    countdown.innerHTML = `
        <h3 style="font-size: 1.5rem; margin-bottom: 15px;">Next Episode</h3>
        <p style="font-size: 1rem; color: #b3b3b3; margin-bottom: 20px;">Chapter Two: Vecna's Curse</p>
        <div style="font-size: 3rem; margin-bottom: 20px;" id="countdownNumber">5</div>
        <button id="playNowBtn" style="
            background-color: #e50914;
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
            margin-right: 10px;
        ">Play Now</button>
        <button id="cancelBtn" style="
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
            border: 1px solid white;
            padding: 12px 30px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
        ">Cancel</button>
    `;
    
    document.querySelector('.video-container').appendChild(countdown);
    
    let count = 5;
    const countdownInterval = setInterval(() => {
        count--;
        const numberEl = document.getElementById('countdownNumber');
        if (numberEl) {
            numberEl.textContent = count;
        }
        
        if (count === 0) {
            clearInterval(countdownInterval);
            countdown.remove();
            nextEpisodeBtn.click();
        }
    }, 1000);
    
    document.getElementById('playNowBtn').addEventListener('click', () => {
        clearInterval(countdownInterval);
        countdown.remove();
        nextEpisodeBtn.click();
    });
    
    document.getElementById('cancelBtn').addEventListener('click', () => {
        clearInterval(countdownInterval);
        countdown.remove();
    });
}

// ===== SUBTITLE TOGGLE =====
const subsBtn = document.getElementById('subsBtn');
subsBtn.addEventListener('click', () => {
    showNotification('Subtitle options coming soon!');
});

// ===== SETTINGS =====
const settingsBtn = document.getElementById('settingsBtn');
settingsBtn.addEventListener('click', () => {
    showNotification('Settings menu coming soon!');
});

// ===== EPISODE SELECTION =====
const episodeItems = document.querySelectorAll('.episode-item');
episodeItems.forEach((item, index) => {
    item.addEventListener('click', () => {
        // Remove active class from all episodes
        episodeItems.forEach(ep => ep.classList.remove('active'));
        
        // Add active class to clicked episode
        item.classList.add('active');
        
        // Scroll to top and play
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
            video.currentTime = 0;
            video.play();
            showNotification(`Playing Episode ${index + 1}`);
        }, 500);
    });
});

// ===== SEASON SELECTOR =====
const seasonSelect = document.querySelector('.season-select');
seasonSelect.addEventListener('change', (e) => {
    showNotification(`Loading Season ${e.target.value}...`);
    
    // Simulate loading episodes
    setTimeout(() => {
        showNotification(`Season ${e.target.value} loaded`);
    }, 1000);
});

// ===== KEYBOARD SHORTCUTS HELP =====
document.addEventListener('keydown', (e) => {
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        showKeyboardShortcuts();
    }
});

function showKeyboardShortcuts() {
    const shortcuts = document.createElement('div');
    shortcuts.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: rgba(0, 0, 0, 0.95);
        padding: 40px;
        border-radius: 10px;
        z-index: 10000;
        max-width: 500px;
        width: 90%;
    `;
    
    shortcuts.innerHTML = `
        <h3 style="font-size: 1.5rem; margin-bottom: 20px;">Keyboard Shortcuts</h3>
        <div style="display: grid; gap: 10px; font-size: 0.9rem;">
            <div style="display: flex; justify-content: space-between;">
                <span>Play/Pause</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">Space</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Rewind 10s</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">←</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Forward 10s</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">→</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Volume Up</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">↑</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Volume Down</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">↓</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Mute</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">M</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Fullscreen</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">F</kbd>
            </div>
            <div style="display: flex; justify-content: space-between;">
                <span>Exit</span>
                <kbd style="background: #333; padding: 5px 10px; border-radius: 3px;">Esc</kbd>
            </div>
        </div>
        <button id="closeShortcuts" style="
            margin-top: 20px;
            width: 100%;
            background-color: #e50914;
            color: white;
            border: none;
            padding: 10px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 5px;
            cursor: pointer;
        ">Close</button>
    `;
    
    document.body.appendChild(shortcuts);
    
    document.getElementById('closeShortcuts').addEventListener('click', () => {
        shortcuts.remove();
    });
    
    // Close on escape
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            shortcuts.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

// ===== NOTIFICATION FUNCTION (from main script) =====
function showNotification(message) {
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: rgba(255, 255, 255, 0.95);
        color: #141414;
        padding: 15px 30px;
        border-radius: 5px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    // Set initial volume
    video.volume = 1;
    volumeSlider.value = 100;
    
    // Show controls initially
    videoControls.classList.add('active');
    
    console.log('RAOUFz Watch Page initialized! 🎬');
});