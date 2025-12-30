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
        
        if (targetId === 'library') {
            loadGlobalSongs();
        }
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
            'enablejsapi': 1,
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

// --- 4. SEARCH LOGIC (GLOBAL UNLOCKED) 🌍 ---
const PIPED_API = "https://pipedapi.kavin.rocks";

async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (document.getElementById("searchInput")) document.getElementById("searchInput").blur(); 
    if (!query) return;

    resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>Searching Worldwide... 🌍</p>";

    try {
        // 👇 YAHAN CHANGE KIYA HAI: 'filter=music_videos' hata diya.
        // Ab 'filter=all' hai, matlab sab kuch search hoga!
        const res = await fetch(`${PIPED_API}/search?q=${query}&filter=all`);
        const data = await res.json();
        
        resultsDiv.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            resultsDiv.innerHTML = "<p style='width:100%; text-align:center;'>No results found</p>";
            return;
        }

        data.items.slice(0, 20).forEach(item => { // Ab 15 ki jagah 20 gaane dikhenge
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
    } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = "<p style='text-align:center; color:red'>Error searching. Try again.</p>";
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
                document.documentElement.style.setProperty('--vibe-color', '255, 215, 0');
            }
        };
        if (img.complete) applyColor();
        else img.addEventListener('load', applyColor);
    }
}

const vibeOverlay = document.getElementById('vibeOverlay');
if(vibeOverlay) vibeOverlay.addEventListener('click', toggleVibeMode);
                    
