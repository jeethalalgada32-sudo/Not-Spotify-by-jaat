// --- 1. SIDEBAR & THEME LOGIC ---
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const pages = document.querySelectorAll(".page");
const links = document.querySelectorAll(".sidebar a");

if (menuBtn) {
    menuBtn.onclick = () => sidebar.classList.toggle("show");
}

document.addEventListener('click', (e) => {
    if (!sidebar.contains(e.target) && !menuBtn.contains(e.target) && sidebar.classList.contains('show')) {
        sidebar.classList.remove("show");
    }
});

links.forEach(l => {
    l.onclick = () => {
        pages.forEach(p => p.classList.remove("active"));
        const targetId = l.dataset.page;
        const targetPage = document.getElementById(targetId);
        if (targetPage) targetPage.classList.add("active");
        sidebar.classList.remove("show");
        if (targetId === 'library') loadGlobalSongs();
    }
});

function setTheme(t) { document.body.className = t; }

// --- 2. YOUTUBE PLAYER SETUP (OFFICIAL & SECURE) ---
var tag = document.createElement('script');
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
            'origin': window.location.origin, 
            'host': 'https://www.youtube.com' 
        },
        events: {
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        extractColorFromThumb();
    }
}

function onPlayerError(event) {
    console.error("YouTube Error:", event.data);
    if (event.data === 150 || event.data === 101) {
        alert("⚠️ Yeh gaana Mobile pe Allowed nahi hai (Copyright). Dusra gaana try karo!");
    }
}

// --- 3. OVERLAY LOGIC ---
const videoOverlay = document.getElementById('videoOverlay');
const closeBtn = document.getElementById('closeBtn');

if (closeBtn) {
    closeBtn.onclick = () => {
        videoOverlay.classList.remove('active');
    }
}

// --- 4. SEARCH LOGIC (MEGA LIST - 20+ SERVERS) 🌍💪 ---
const API_LIST = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.drgns.space",
    "https://api-piped.mha.fi",
    "https://pipedapi.tokhmi.xyz",
    "https://pipedapi.moomoo.me",
    "https://pipedapi.syncpundit.io",
    "https://pipedapi.leptons.xyz",
    "https://pipedapi.r4fo.com",
    "https://pipedapi.ducks.party",
    "https://api.piped.privacy.com.de",
    "https://pipedapi.smnz.de",
    "https://pipedapi.adminforge.de",
    "https://piped-api.garudalinux.org",
    "https://pipedapi.kavin.rocks",
    "https://pa.il.ax",
    "https://p.eji.io",
    "https://piped-api.lunar.icu",
    "https://ytapi.dc09.ru",
    "https://pipedapi.aeong.one"
];

async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (document.getElementById("searchInput")) document.getElementById("searchInput").blur(); 
    if (!query) return;

    resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>Searching (Trying all servers)... 🌍</p>";

    let data = null;
    let success = false;

    // Loop through MEGA LIST
    for (const api of API_LIST) {
        try {
            // Timeout lagaya hai taaki agar koi server slow ho to uspe time waste na ho
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second max wait per server

            const res = await fetch(`${api}/search?q=${query}&filter=music_videos`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!res.ok) throw new Error("Blocked");
            
            data = await res.json();
            
            if (data.items && data.items.length > 0) {
                success = true;
                break; // Mil gaya! Roko loop.
            }
        } catch (err) {
            continue; // Fail hua? Next pe kudo.
        }
    }

    resultsDiv.innerHTML = "";

    if (!success || !data) {
        resultsDiv.innerHTML = `
            <div style='text-align:center; width:100%; padding:20px;'>
                <p style='color:red; font-weight:bold;'>All 20+ Servers Failed 😓</p>
                <p>Vercel IP is heavily blocked right now.</p>
                <button onclick="searchYT()" style="background:#ffd700; border:none; padding:10px; border-radius:5px; margin-top:10px;">Try Again</button>
            </div>
        `;
        return;
    }

    data.items.slice(0, 20).forEach(item => {
        if (item.type !== 'stream') return;
        
        let videoId = item.url.split('v=')[1];
        if(videoId.includes('&')) videoId = videoId.split('&')[0];

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
                
                const tempImg = new Image();
                tempImg.crossOrigin = "Anonymous";
                tempImg.src = thumbUrl;
                tempImg.id = "current-vibe-img";
                tempImg.style.display = "none";
                
                const oldImg = document.getElementById("current-vibe-img");
                if(oldImg) oldImg.remove();
                document.body.appendChild(tempImg);
                
                setTimeout(extractColorFromThumb, 1000);
            }
        };
        resultsDiv.appendChild(div);
    });
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
                document.documentElement.style.setProperty('--vibe-color', '255, 215, 0');
            }
        };
        if (img.complete) applyColor();
        else img.addEventListener('load', applyColor);
    }
}

const vibeOverlay = document.getElementById('vibeOverlay');
if(vibeOverlay) vibeOverlay.addEventListener('click', toggleVibeMode);
            
