// --- 1. SIDEBAR & THEME LOGIC ---
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const pages = document.querySelectorAll(".page");
const links = document.querySelectorAll(".sidebar a");

// Toggle Sidebar
if (menuBtn) {
    menuBtn.onclick = () => {
        sidebar.classList.toggle("show");
    };
}

// Close Sidebar when clicking outside (Optional but good)
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

// --- 2. YOUTUBE PLAYER SETUP (FIXED) ---
// --- 2. YOUTUBE PLAYER SETUP (FIXED HTTPS) ---
var tag = document.createElement('script');
// Galti yahi thi -> Ab hum OFFICIAL aur SECURE link use karenge:
tag.src = "https://www.youtube.com/iframe_api"; 
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: { 
            'autoplay': 1, 
            'playsinline': 1, 
            'rel': 0, 
            'controls': 1,
            // Ye dono lines bahut zaruri hain mobile ke liye:
            'origin': window.location.origin, 
            'host': 'https://www.youtube.com'
        },
        events: {
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        extractColorFromThumb();
    }
}


// --- 3. OVERLAY LOGIC (TIKTOK STYLE) ---
const videoOverlay = document.getElementById('videoOverlay');
const closeBtn = document.getElementById('closeBtn');

if (closeBtn) {
    closeBtn.onclick = () => {
        videoOverlay.classList.remove('active');
        // Video band nahi karna (Background Play)
        // Agar rokna hai to uncomment karein:
        // if (player && player.stopVideo) player.stopVideo();
    }
}

// --- 4. SEARCH LOGIC ---
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
            
            const videoId = item.url.split('v=')[1]; 
            const div = document.createElement("div");
            div.className = "card";
            
            // Thumbnail Image for Color Extraction
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
                    
                    // Set Thumbnail for Vibe extraction
                    // (Hum fake image create kar rahe hain extraction ke liye)
                    const tempImg = new Image();
                    tempImg.crossOrigin = "Anonymous";
                    tempImg.src = thumbUrl;
                    tempImg.id = "current-vibe-img";
                    tempImg.style.display = "none";
                    
                    // Purana hatao, naya lagao
                    const oldImg = document.getElementById("current-vibe-img");
                    if(oldImg) oldImg.remove();
                    document.body.appendChild(tempImg);
                    
                    setTimeout(extractColorFromThumb, 1000);
                }
            };
            resultsDiv.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = "<p style='text-align:center; color:red'>Error searching.</p>";
    }
}

// --- 5. LIBRARY LOGIC (Cloud) ---
// Note: Vercel pe Netlify Functions direct nahi chalenge, par code safe rakha hai.
async function loadGlobalSongs() {
    const libDiv = document.getElementById("librarySongs");
    if(!libDiv) return;
    
    libDiv.innerHTML = "<p style='text-align:center; width:100%'>Library (Coming Soon on Vercel)...</p>";
}

// --- 6. SMART VIBE MODE LOGIC (Colors) ---
function toggleVibeMode() {
    const overlay = document.getElementById('vibeOverlay');
    if (!overlay) return;
    
    if (overlay.style.display === 'block') {
        overlay.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable Scroll
    } else {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Disable Scroll (Lock)
        extractColorFromThumb();
    }
}

function extractColorFromThumb() {
    // Koshish karo current song ka image dhundne ki
    const img = document.getElementById('current-vibe-img') || document.querySelector('.card img'); 
    
    if (img) {
        // ColorThief library honi chahiye index.html me
        if (typeof ColorThief === 'undefined') return;

        const colorThief = new ColorThief();
        
        const applyColor = () => {
            try {
                const color = colorThief.getColor(img);
                const rgb = `${color[0]}, ${color[1]}, ${color[2]}`;
                document.documentElement.style.setProperty('--vibe-color', rgb);
            } catch(e) {
                console.log("Color extraction error (CORS or Loading)", e);
            }
        };

        if (img.complete) {
            applyColor();
        } else {
            img.addEventListener('load', applyColor);
        }
    }
}

// Add Listener for Vibe Overlay Click
const vibeOverlay = document.getElementById('vibeOverlay');
if(vibeOverlay) {
    vibeOverlay.addEventListener('click', toggleVibeMode);
        }
    
