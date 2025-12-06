// ===== GLOBAL VARIABLES =====
let isScrolling = false;
const header = document.getElementById('header');
const audioToggle = document.getElementById('audioToggle');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');

// ===== HEADER SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// ===== CAROUSEL FUNCTIONALITY =====
function initializeCarousels() {
    const carouselContainers = document.querySelectorAll('.carousel-container');
    
    carouselContainers.forEach(container => {
        const carousel = container.querySelector('.carousel');
        const leftBtn = container.querySelector('.carousel-btn-left');
        const rightBtn = container.querySelector('.carousel-btn-right');
        
        if (!carousel || !leftBtn || !rightBtn) return;
        
        // Scroll carousel on button click
        leftBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: -carousel.offsetWidth * 0.8,
                behavior: 'smooth'
            });
        });
        
        rightBtn.addEventListener('click', () => {
            carousel.scrollBy({
                left: carousel.offsetWidth * 0.8,
                behavior: 'smooth'
            });
        });
        
        // Update button visibility based on scroll position
        function updateButtonVisibility() {
            const scrollLeft = carousel.scrollLeft;
            const maxScroll = carousel.scrollWidth - carousel.clientWidth;
            
            leftBtn.style.opacity = scrollLeft > 0 ? '1' : '0';
            rightBtn.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0';
        }
        
        carousel.addEventListener('scroll', updateButtonVisibility);
        updateButtonVisibility();
    });
}

// ===== MOVIE CARD INTERACTIONS =====
function initializeMovieCards() {
    const movieCards = document.querySelectorAll('.movie-card');
    
    movieCards.forEach(card => {
        // Play button
        const playBtn = card.querySelector('.play-btn-small');
        if (playBtn) {
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playVideo();
            });
        }
        
        // Add to list button
        const addBtn = card.querySelector('.add-btn');
        if (addBtn) {
            addBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMyList(addBtn);
            });
        }
        
        // Like button
        const likeBtn = card.querySelector('.like-btn');
        if (likeBtn) {
            likeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleLike(likeBtn);
            });
        }
        
        // Expand button
        const expandBtn = card.querySelector('.expand-btn');
        if (expandBtn) {
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showMoreInfo(card);
            });
        }
        
        // Play overlay (for continue watching)
        const playOverlay = card.querySelector('.play-overlay');
        if (playOverlay) {
            playOverlay.addEventListener('click', (e) => {
                e.stopPropagation();
                playVideo();
            });
        }
    });
}

// ===== YOUTUBE PLAYER =====
let player;
let isPlayerReady = false;

// This function creates an <iframe> (and YouTube player)
function onYouTubeIframeAPIReady() {
    isPlayerReady = true;
    console.log('YouTube API Ready');
}

function playYouTubeVideo(videoId) {
    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Destroy existing player if any
    if (player) {
        player.destroy();
    }
    
    // Create new YouTube player
    player = new YT.Player('youtubePlayer', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1,
            'modestbranding': 1,
            'rel': 0,
            'playsinline': 1,
            'fs': 1,
            'cc_load_policy': 0,
            'iv_load_policy': 3,
            'enablejsapi': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    console.log('Player ready, starting video...');
    event.target.playVideo();
    event.target.setVolume(100);
}

function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED = 0
    // YT.PlayerState.PLAYING = 1
    // YT.PlayerState.PAUSED = 2
    // YT.PlayerState.BUFFERING = 3
    
    if (event.data === YT.PlayerState.PLAYING) {
        console.log('Video is playing');
    } else if (event.data === YT.PlayerState.ENDED) {
        console.log('Video ended');
        // Optional: Close modal when video ends
        // setTimeout(() => closeVideoModal(), 2000);
    } else if (event.data === YT.PlayerState.PAUSED) {
        console.log('Video paused');
    }
}

function onPlayerError(event) {
    console.error('YouTube Player Error:', event.data);
    let errorMessage = 'Error loading video. ';
    
    switch(event.data) {
        case 2:
            errorMessage += 'Invalid video ID.';
            break;
        case 5:
            errorMessage += 'HTML5 player error.';
            break;
        case 100:
            errorMessage += 'Video not found or private.';
            break;
        case 101:
        case 150:
            errorMessage += 'Video owner does not allow embedding.';
            break;
        default:
            errorMessage += 'Please try again later.';
    }
    
    showNotification(errorMessage);
}

function closeVideoModal() {
    videoModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Stop and destroy YouTube player
    if (player && typeof player.stopVideo === 'function') {
        player.stopVideo();
        player.destroy();
        player = null;
    }
    
    // Recreate the div for next video
    const container = document.getElementById('videoPlayerContainer');
    container.innerHTML = '<div id="youtubePlayer"></div>';
}

// ===== VIDEO MODAL (Legacy function for compatibility) =====
function playVideo(videoUrl) {
    // Extract video ID if it's a full URL
    let videoId = videoUrl;
    if (videoUrl && videoUrl.includes('youtube.com')) {
        const urlParams = new URLSearchParams(new URL(videoUrl).search);
        videoId = urlParams.get('v') || videoUrl.split('/embed/')[1]?.split('?')[0];
        
        // Handle YouTube Shorts URLs
        if (videoUrl.includes('/shorts/')) {
            videoId = videoUrl.split('/shorts/')[1]?.split('?')[0];
        }
    } else if (videoUrl && videoUrl.includes('youtu.be')) {
        videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    }
    
    if (videoId) {
        playYouTubeVideo(videoId);
    }
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && videoModal.classList.contains('active')) {
        closeVideoModal();
    }
});

// Close modal on background click
videoModal.addEventListener('click', (e) => {
    if (e.target === videoModal) {
        closeVideoModal();
    }
});

// ===== MY LIST FUNCTIONALITY =====
function toggleMyList(button) {
    const icon = button.querySelector('svg');
    
    if (button.classList.contains('added')) {
        button.classList.remove('added');
        icon.innerHTML = '<path d="M12 5V19M5 12H19"/>';
        showNotification('Removed from My List');
    } else {
        button.classList.add('added');
        icon.innerHTML = '<path d="M5 13L9 17L19 7"/>';
        showNotification('Added to My List');
    }
}

// ===== LIKE FUNCTIONALITY =====
function toggleLike(button) {
    if (button.classList.contains('liked')) {
        button.classList.remove('liked');
        showNotification('Rating removed');
    } else {
        button.classList.add('liked');
        showNotification('Thanks for rating!');
    }
    
    // Add a scale animation
    button.style.transform = 'scale(1.3)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 200);
}

// ===== MORE INFO =====
function showMoreInfo(card) {
    // This would typically open a detailed modal
    // For now, we'll just show a notification
    showNotification('More info coming soon!');
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
    // Remove existing notifications
    const existing = document.querySelector('.notification-toast');
    if (existing) {
        existing.remove();
    }
    
    // Create notification
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
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(-50%) translateY(100px)';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== AUDIO TOGGLE =====
if (audioToggle) {
    let isMuted = true;
    
    audioToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        
        if (isMuted) {
            audioToggle.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                    <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
        } else {
            audioToggle.innerHTML = `
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11 5L6 9H2V15H6L11 19V5Z"/>
                    <path d="M23 9L17 15M17 9L23 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
            `;
        }
    });
}

// ===== LAZY LOADING IMAGES =====
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src;
                    img.classList.remove('loading');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => {
            img.classList.add('loading');
            imageObserver.observe(img);
        });
    }
}

// ===== SEARCH FUNCTIONALITY =====
const searchBtn = document.querySelector('.search-btn');
if (searchBtn) {
    let searchOpen = false;
    
    searchBtn.addEventListener('click', () => {
        if (!searchOpen) {
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Titles, people, genres';
            searchInput.className = 'search-input';
            searchInput.style.cssText = `
                background-color: rgba(0, 0, 0, 0.8);
                border: 1px solid white;
                color: white;
                padding: 8px 12px;
                margin-left: 10px;
                outline: none;
                font-size: 14px;
                width: 0;
                transition: width 0.3s ease;
            `;
            
            searchBtn.parentElement.insertBefore(searchInput, searchBtn.nextSibling);
            
            setTimeout(() => {
                searchInput.style.width = '250px';
                searchInput.focus();
            }, 10);
            
            searchInput.addEventListener('blur', () => {
                setTimeout(() => {
                    searchInput.style.width = '0';
                    setTimeout(() => {
                        searchInput.remove();
                        searchOpen = false;
                    }, 300);
                }, 200);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch(searchInput.value);
                }
            });
            
            searchOpen = true;
        }
    });
}

function performSearch(query) {
    if (query.trim()) {
        showNotification(`Searching for "${query}"...`);
        // Actual search implementation would go here
    }
}

// ===== SMOOTH SCROLLING FOR NAV LINKS =====
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        // Update active state
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// ===== KEYBOARD NAVIGATION =====
document.addEventListener('keydown', (e) => {
    const carousels = document.querySelectorAll('.carousel');
    
    carousels.forEach(carousel => {
        if (carousel.matches(':hover')) {
            if (e.key === 'ArrowLeft') {
                carousel.scrollBy({
                    left: -300,
                    behavior: 'smooth'
                });
            } else if (e.key === 'ArrowRight') {
                carousel.scrollBy({
                    left: 300,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== HERO VIDEO AUTOPLAY (if video background is added) =====
function initializeHeroVideo() {
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.muted = true;
        heroVideo.play().catch(err => {
            console.log('Autoplay prevented:', err);
        });
    }
}

// ===== MATURITY RATING BADGE =====
function getMaturityRating(rating) {
    const ratings = {
        '7+': { color: '#00a8e1', text: '7+' },
        '13+': { color: '#ffc107', text: '13+' },
        '16+': { color: '#ff6f00', text: '16+' },
        '18+': { color: '#e50914', text: '18+' }
    };
    
    return ratings[rating] || ratings['13+'];
}

// ===== PERFORMANCE MONITORING =====
function logPerformance() {
    if ('performance' in window) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
            }, 0);
        });
    }
}

// ===== PREVENT IMAGE DRAG =====
document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// ===== HOVER PREVIEW DELAY =====
let hoverTimeout;
document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(() => {
            // Could load preview video here
            card.classList.add('preview-active');
        }, 800);
    });
    
    card.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
        card.classList.remove('preview-active');
    });
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
function initializeScrollAnimations() {
    const sections = document.querySelectorAll('.content-section');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });
}

// ===== NETWORK STATUS =====
window.addEventListener('online', () => {
    showNotification('Connection restored');
});

window.addEventListener('offline', () => {
    showNotification('No internet connection');
});

// ===== SERVICE WORKER FOR CACHING (Optional) =====
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

// ===== INITIALIZE EVERYTHING ON DOM LOAD =====
document.addEventListener('DOMContentLoaded', () => {
    initializeCarousels();
    initializeMovieCards();
    initializeLazyLoading();
    initializeHeroVideo();
    initializeScrollAnimations();
    logPerformance();
    
    // Preload critical images
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
        const img = new Image();
        img.src = heroImage.src;
    }
    
    console.log('RAOUFz initialized successfully! 🎬');
});

// ===== WINDOW RESIZE HANDLER =====
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Reinitialize carousels on resize
        initializeCarousels();
    }, 250);
});

// ===== CUSTOM CURSOR FOR MOVIE CARDS (Optional Enhancement) =====
document.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        document.body.style.cursor = 'pointer';
    });
    
    card.addEventListener('mouseleave', () => {
        document.body.style.cursor = 'default';
    });
});

// Make functions globally available
window.playVideo = playVideo;
window.playYouTubeVideo = playYouTubeVideo;
window.closeVideoModal = closeVideoModal;