const video = document.getElementById('videoPlayer');
const controlsOverlay = document.getElementById('controlsOverlay');
const playBtn = document.getElementById('playBtn');
const playPauseBtn = document.getElementById('playPauseBtn');
const rewindBtn = document.getElementById('rewindBtn');
const forwardBtn = document.getElementById('forwardBtn');
const progressBar = document.getElementById('progressBar');
const progressFilled = document.getElementById('progressFilled');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeBtn = document.getElementById('volumeBtn');
const volumeSlider = document.getElementById('volumeSlider');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const loadingSpinner = document.getElementById('loadingSpinner');
const playerContainer = document.querySelector('.player-container');

let controlsTimeout;
let isPlaying = false;

video.preload = 'auto';
video.playbackRate = 1.0;
video.defaultPlaybackRate = 1.0;

const xhr = new XMLHttpRequest();
xhr.open('GET', video.querySelector('source').src, true);
xhr.responseType = 'blob';
xhr.onprogress = () => {};
xhr.send();

setInterval(() => {
    if (video.buffered.length > 0 && !video.paused) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferAhead = bufferedEnd - video.currentTime;
        if (bufferAhead < 90) {
            const tempTime = video.currentTime;
            video.currentTime = tempTime + 0.01;
        }
    }
}, 500);

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function togglePlay() {
    if (video.paused) {
        video.play();
        isPlaying = true;
        updatePlayButton(true);
    } else {
        video.pause();
        isPlaying = false;
        updatePlayButton(false);
    }
}

function updatePlayButton(playing) {
    const playIcon = '<path d="M8 5v14l11-7z"/>';
    const pauseIcon = '<path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>';
    playBtn.querySelector('svg').innerHTML = playing ? pauseIcon : playIcon;
    playPauseBtn.querySelector('svg').innerHTML = playing ? pauseIcon : playIcon;
}

function showControls() {
    controlsOverlay.classList.add('show');
    playerContainer.classList.add('show-cursor');
    clearTimeout(controlsTimeout);
    if (isPlaying) {
        controlsTimeout = setTimeout(() => {
            controlsOverlay.classList.remove('show');
            playerContainer.classList.remove('show-cursor');
        }, 3000);
    }
}

function updateProgress() {
    if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.value = percent;
        progressFilled.style.width = percent + '%';
        currentTimeEl.textContent = formatTime(video.currentTime);
    }
}

playBtn.addEventListener('click', togglePlay);
playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

rewindBtn.addEventListener('click', () => {
    video.currentTime = Math.max(0, video.currentTime - 15);
});

forwardBtn.addEventListener('click', () => {
    video.currentTime = Math.min(video.duration, video.currentTime + 15);
});

video.addEventListener('timeupdate', updateProgress);

video.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(video.duration);
    currentTimeEl.textContent = formatTime(0);
    loadingSpinner.classList.remove('show');
});

video.addEventListener('loadeddata', () => {
    loadingSpinner.classList.remove('show');
});

progressBar.addEventListener('input', (e) => {
    if (video.duration) {
        const time = (e.target.value / 100) * video.duration;
        video.currentTime = time;
    }
});

volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value / 100;
});

volumeBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    const muteIcon = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
    const volumeIcon = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
    volumeBtn.querySelector('svg').innerHTML = video.muted ? muteIcon : volumeIcon;
});

fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        playerContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

playerContainer.addEventListener('mousemove', showControls);
playerContainer.addEventListener('touchstart', showControls);

video.addEventListener('waiting', () => {
    loadingSpinner.classList.add('show');
});

video.addEventListener('canplay', () => {
    loadingSpinner.classList.remove('show');
});

video.addEventListener('playing', () => {
    loadingSpinner.classList.remove('show');
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
