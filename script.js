// --- SIDEBAR & THEME LOGIC ---
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");
const pages = document.querySelectorAll(".page");
const links = document.querySelectorAll(".sidebar a");

if(menuBtn) {
    menuBtn.onclick = () => sidebar.classList.toggle("show");
}

links.forEach(l => {
    l.onclick = () => {
        pages.forEach(p => p.classList.remove("active"));
        document.getElementById(l.dataset.page).classList.add("active");
        sidebar.classList.remove("show");
        
        // Agar Library page khula, to Cloud se gaane mangwao
        if(l.dataset.page === 'library') {
            loadGlobalSongs();
        }
    }
});

function setTheme(t) { document.body.className = t; }

// --- YOUTUBE PLAYER SETUP (FIXED FOR VERCEL) ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api"; // Updated to official API URL
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
            'origin': window.location.origin // <--- YE WALI LINE JODI HAI (IMPORTANT)
        }
    });
}

// --- OVERLAY LOGIC ---
const videoOverlay = document.getElementById('videoOverlay');
const closeBtn = document.getElementById('closeBtn');

if(closeBtn) {
    closeBtn.onclick = () => {
        videoOverlay.classList.remove('active');
        if (player && player.stopVideo) player.stopVideo();
    }
}

// --- DATABASE: SAVE SONG (Dil Wala Kaam) ❤️ ---
async function saveToCloud(title, videoId, thumbnail) {
    const btn = event.target; // Jis button pe click hua
    btn.innerText = "⏳"; // Loading dikhao

    try {
        // Note: Netlify functions might not work on Vercel directly without config, 
        // but keeping code intact for now.
        const response = await fetch('/.netlify/functions/songs', {
            method: 'POST',
            body: JSON.stringify({ title, videoId, thumbnail })
        });
        
        if(response.ok) {
            btn.innerText = "✅"; // Success
            alert("Song Saved to Global Database! 🌍");
        } else {
            btn.innerText = "❌";
        }
    } catch (err) {
        console.error(err);
        btn.innerText = "❌";
        alert("Error saving song");
    }
    // Button click hone par gaana play na ho, isliye stopPropagation
    event.stopPropagation(); 
}

// --- DATABASE: LOAD SONGS (Library) ---
async function loadGlobalSongs() {
    const libDiv = document.getElementById("librarySongs");
    libDiv.innerHTML = "<p style='text-align:center; width:100%'>Loading from Cloud... ☁️</p>";
    
    try {
        const res = await fetch('/.netlify/functions/songs');
        const songs = await res.json();
        
        libDiv.innerHTML = ""; // Clear loading text
        
        if(songs.length === 0) {
            libDiv.innerHTML = "<p style='text-align:center; width:100%'>No songs yet. Go search and add some! ❤️</p>";
            return;
        }

        songs.forEach(song => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <img src="${song.thumbnail}" onerror="this.src='https://via.placeholder.com/150'">
                <p>${song.title}</p>
                <small style="color:#d4af37; font-size:10px;">Global Hit 🌍</small>
            `;
            div.onclick = () => {
                if(player) {
                    player.loadVideoById(song.video_id);
                    videoOverlay.classList.add('active');
                }
            };
            libDiv.appendChild(div);
        });
    } catch (err) {
        console.error(err);
        libDiv.innerHTML = "<p style='text-align:center; color:red'>Database Error. Refresh page.</p>";
    }
}

// --- SEARCH LOGIC (With Save Button) ---
const PIPED_API = "https://pipedapi.kavin.rocks";

async function searchYT() {
    const query = document.getElementById("searchInput").value.trim();
    const resultsDiv = document.getElementById("results");

    document.getElementById("searchInput").blur(); 
    if (!query) return;

    resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>Searching...</p>";

    try {
        const res = await fetch(`${PIPED_API}/search?q=${query}&filter=music_videos`);
        const data = await res.json();
        
        resultsDiv.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            resultsDiv.innerHTML = "<p style='width:100%; text-align:center; padding:20px;'>No results found</p>";
            return;
        }

        data.items.slice(0, 15).forEach(item => {
            if (item.type !== 'stream') return;
            const videoId = item.url.split('v=')[1]; 
            
            const div = document.createElement("div
                                               
