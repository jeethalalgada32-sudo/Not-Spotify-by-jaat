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

// --- 2. YOUTUBE PLAYER SETUP (OFFICIAL) ---
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
    if (event.data === 150 || event.data === 101) {
        alert("⚠️ Song Restricted (Copyright). Try another!");
    }
}

// --- 3. OVERLAY LOGIC ---
const videoOverlay = document.getElementById('videoOverlay');
const closeBtn = document.getElementById('closeBtn');
if (closeBtn) {
    closeBtn.onclick = () => videoOverlay.classList.remove('active');
}

// --- 4. SEARCH LOGIC (OFFICIAL API KEY 🔑) ---

// ✅ TERI ORIGINAL API KEY (Ab search goli ki tarah chalega):
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";

async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    if (document.getElementById("searchInput")) document.getElementById("searchInput").blur(); 
    if (!query) return;

    resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>Searching YouTube... 🚀</p>";
    
    try {
        // OFFICIAL GOOGLE API CALL
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=20&q=${query}&type=video&key=${YOUTUBE_API_KEY}`;
        
        const res = await fetch(url);
        const data = await res.json();

        resultsDiv.innerHTML = ""; // Clear loading text

        if (data.error) {
            console.error("API Error:", data.error);
            resultsDiv.innerHTML = "<p style='text-align:center; color:red'>API Limit Reached or Error.</p>";
            return;
        }

        if (!data.items || data.items.length === 0) {
            resultsDiv.innerHTML = "<p style='width:100%; text-align:center;'>No results found.</p>";
            return;
        }

        data.items.forEach(item => {
            const videoId = item.id.videoId;
            const title = item.snippet.title;
            const thumbUrl = item.snippet.thumbnails.medium.url;

            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <img src="${thumbUrl}" class="song-thumbnail" crossorigin="anonymous">
                <div class="card-info"><p>${title}</p></div>
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
        resultsDiv.innerHTML = "<p style='text-align:center; color:red'>Search Error. Check Internet.</p>";
    }
}

// --- 5. LIBRARY & VIBE LOGIC ---
async function loadGlobalSongs() {
    document.getElementById("librarySongs").innerHTML = "<p style='text-align:center'>Library coming soon...</p>";
}

function toggleVibeMode() {
    const overlay = document.getElementById('vibeOverlay');
    if (!overlay) return;
    overlay.style.display = (overlay.style.display === 'block') ? 'none' : 'block';
    if(overlay.style.display === 'block') extractColorFromThumb();
}

function extractColorFromThumb() {
    const img = document.getElementById('current-vibe-img') || document.querySelector('.card img'); 
    if (img) {
        if (typeof ColorThief === 'undefined') return;
        const colorThief = new ColorThief();
        const applyColor = () => {
            try {
                const color = colorThief.getColor(img);
                document.documentElement.style.setProperty('--vibe-color', `${color[0]}, ${color[1]}, ${color[2]}`);
            } catch(e) {}
        };
        if (img.complete) applyColor(); else img.addEventListener('load', applyColor);
    }
}
if(document.getElementById('vibeOverlay')) document.getElementById('vibeOverlay').addEventListener('click', toggleVibeMode);
        
