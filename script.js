// --- 1. SIDEBAR & THEME LOGIC ---
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const pages = document.querySelectorAll(".page");
const links = document.querySelectorAll(".sidebar a");

if (menuBtn) {
    menuBtn.onclick = () => {
        sidebar.classList.toggle("show");
    };
}

// Close Sidebar when clicking outside
document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('show')) {
        sidebar.classList.remove("show");
    }
});

// Page Navigation
links.forEach(l => {
    l.onclick = () => {
        pages.forEach(p => p.classList.remove("active"));
        const targetId = l.dataset.page;
        const targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add("active");
        
        sidebar.classList.remove("show");
        
        if (targetId === 'library') {
            loadGlobalSongs();
        }
    }
});

function setTheme(t) { document.body.className = t; }

// --- 2. YOUTUBE PLAYER SETUP (FINAL & SECURE) ---
var tag = document.createElement('script');

// 🔴 MAIN FIX: Humne 'http' hata kar OFFICIAL 'https' laga diya hai.
// Ye link puri duniya me chalti hai aur kabhi block nahi hogi.
tag.src = "https://www.youtube.com/iframe_api"; 

var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '', // Start blank
        playerVars: { 
            'autoplay': 1, 
            'playsinline': 1, 
            'rel': 0, 
            'controls': 1,
            'enablejsapi': 1,
            // ✅ Origin fix for Vercel/Mobile
            'origin': window.location.origin 
        },
        events: {
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerStateChange(event) {
    // Jab video play ho, tabhi color uthao
    if (event.data == YT.PlayerState.PLAYING) {
        extractColorFromThumb();
    }
}

function onPlayerError(event) {
    console.error("YouTube Player Error:", event.data);
}

// --- 3. OVERLAY LOGIC ---
const videoOverlay = document.getElementById('videoOverlay');
const closeBtn = document.getElementById('closeBtn');

if (closeBtn) {
    closeBtn.onclick = () => {
        videoOverlay.classList.remove('active');
        // Video chalta rahega background me
    }
}

// --- 4. SEARCH LOGIC (Piped API) ---
const PIPED_API = "https://pipedapi.kavin.rocks";

async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (document.getElementById("searchInput")) document.getElementById("searchInput").blur(); 
    if (!query) return;

    resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>Searching... 🎵</p>";

    try {
        const res = await fetch(`${PIPED_API}/search?q=${query}&filter=music_videos`);
        const data = await res.json();
        
        resultsDiv.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            resultsDiv.innerHTML = "<p style='width:100%; text-align:center;'>No results found</p>";
            return;
        }

        data.items.slice(0, 15).forEach(item => {
            if (item.type !== 'stream') return;
            
            // Extract Video ID safely
            let videoId = item.url.split('v=')[1];
            if(videoId.includes('&')) videoId = videoId.split('&')[0]; // Extra safayi

            const div = document.createElement("div");
            div.className = "card";
            const thumbUrl = item.thumbnail;
            
            div.innerHTML = `
                <img src="${thumbUrl}" class="song-thumbnail" crossorigin="anonymous">
                <div class="card-info">
                    <p>${item.title}</p>
                </div>
            `;
            
            div.onclick = () => {
                if (player) {
                    player.loadVideoById(videoId);
                    videoOverlay.classList.add('active');
                    
                    // Vibe Mode ke liye image set karo
                    const tempImg = new Image();
                    tempImg.crossOrigin = "Anonymous";
                    tempImg.src = thumbUrl;
                    tempImg.id = "current-vibe-img";
                    tempImg.style.display = "none";
                    
                    const oldImg = document.getElementById("current-vibe-img");
                    if(oldImg) oldImg.remove();
                    document.body.appendChild(tempImg);
                    
                    // Thoda ruk kar color nikalo taaki image load ho jaye
                    setTimeout(extractColorFromThumb, 1000);
                }
            };
            resultsDiv.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = "<p style='text-align:center; color:red'>Search Failed. Try again.</p>";
    }
}

// --- 5. LIBRARY LOGIC ---
async function loadGlobalSongs() {
    const libDiv = document.getElementById("librarySongs");
    if(!libDiv) return;
    libDiv.innerHTML = "<p style='text-align:center; width:100%'>Library coming soon...</p>";
}

// --- 6. SMART VIBE MODE LOGIC ---
function toggleVibeMode() {
    const overlay = document.getElementById('vibeOverlay');
    if (!overlay) return;
    
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto'; 
    } else {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        extractColorFromThumb();
    }
}

function extractColorFromThumb() {
    const img = document.getElementById('current-vibe-img') || document.querySelector('.card img'); 
    
    if (img) {
        if (typeof ColorThief === 'undefined') return;
        
        const colorThief = new ColorThief();
        const applyColor = () => {
            try {
                const color = colorThief.getColor(img);
                const rgb = `${color[0]}, ${color[1]}, ${color[2]}`;
                document.documentElement.style.setProperty('--vibe-color', rgb);
            } catch(e) {
                // Agar color na mile, to default Gold color laga do
                console.log("Color Defaulting");
                document.documentElement.style.setProperty('--vibe-color', '255, 215, 0');
            }
        };

        if (img.complete) applyColor();
        else img.addEventListener('load', applyColor);
    }
}

// Add Listener
const vibeOverlay = document.getElementById('vibeOverlay');
if(vibeOverlay) {
    vibeOverlay.addEventListener('click', toggleVibeMode);
}
    
