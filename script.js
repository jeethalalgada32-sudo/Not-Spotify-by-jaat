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
tag.src = "https://www.youtube.com/iframe_api"; // ✅ Official HTTPS API
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
            'host': 'https://www.youtube.com' // ✅ Correct Host
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

// --- 4. SEARCH LOGIC (AVENGERS TEAM 🛡️) ---
// Yahan humne 5 alag-alag servers ki list banayi hai.
const API_LIST = [
    "https://pipedapi.kavin.rocks",     // 1. Official
    "https://pipedapi.tokhmi.xyz",      // 2. Backup 1
    "https://pipedapi.moomoo.me",       // 3. Backup 2
    "https://pipedapi.syncpundit.io",   // 4. Backup 3
    "https://api-piped.mha.fi"          // 5. Backup 4
];

async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (document.getElementById("searchInput")) document.getElementById("searchInput").blur(); 
    if (!query) return;

    resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>Searching... 🎵</p>";

    // Loop through API List (Avengers Strategy)
    let data = null;
    let success = false;

    for (const api of API_LIST) {
        try {
            console.log("Trying Server:", api); // Console me dekhna kaunsa server chala
            const res = await fetch(`${api}/search?q=${query}&filter=all`);
            data = await res.json();
            
            if (data.items && data.items.length > 0) {
                success = true;
                break; // Agar data mil gaya, to loop yahi roko!
            }
        } catch (err) {
            console.log("Server Failed:", api); // Ye server fail hua, agla try karo
        }
    }

    resultsDiv.innerHTML = "";

    if (!success || !data) {
        resultsDiv.innerHTML = "<p style='width:100%; text-align:center; color:red;'>All Servers Busy. Try again in 1 min! 😓</p>";
        return;
    }

    // Result Show Karo
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
        
