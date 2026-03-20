const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI";

let player, isMatrixOn = false;
let listenHistory = JSON.parse(localStorage.getItem('streamflow_history')) || [];
window.matrixColor = "#00f2ff";

// --- SIDEBAR & NAV ---
document.getElementById("menuBtn").onclick = () => document.getElementById("sidebar").classList.toggle("show");

// --- YOUTUBE API ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'rel': 0 },
        events: { 'onStateChange': (e) => { if(e.data == 1 && isMatrixOn) startMatrixEffect(); } }
    });
}

// --- GEMINI SMART SEARCH & VIBE ---
async function askGemini() {
    const input = document.getElementById("searchInput").value.trim();
    if (!input) return;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>Gemini is analyzing the vibe... ⚡</h2></div>";

    try {
        const prompt = `User vibe: "${input}". 
        1. Pick 1 best YouTube search term (Song+Artist).
        2. Pick 1 neon hex color for this mood.
        Return ONLY JSON: {"search": "...", "color": "..."}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const aiResponse = JSON.parse(data.candidates[0].content.parts[0].text.replace(/```json|```/g, ""));

        document.documentElement.style.setProperty('--accent', aiResponse.color);
        window.matrixColor = aiResponse.color;
        document.getElementById("searchInput").value = aiResponse.search;
        searchYT(); 
    } catch (e) { searchYT(); }
}

// --- YOUTUBE SEARCH ---
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center; padding-top:100px;'>Summoning tracks... 🚀</p>";

    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    resultsDiv.innerHTML = "";

    data.items.forEach(item => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><div style="padding:10px; font-size:12px;">${item.snippet.title}</div>`;
        div.onclick = () => {
            player.loadVideoById(item.id.videoId);
            document.getElementById("player").classList.add("visible");
            document.getElementById("videoOverlay").classList.add("active");
            listenHistory.push(item.snippet.title);
            localStorage.setItem('streamflow_history', JSON.stringify(listenHistory));
        };
        resultsDiv.appendChild(div);
    });
}

// --- GEMINI RECAP ---
async function generateRecap() {
    document.getElementById("sidebar").classList.remove("show");
    const history = JSON.parse(localStorage.getItem('streamflow_history')) || [];
    if (history.length < 3) {
        alert("Bhai, kam se kam 3 gaane suno recap ke liye!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>Generating your recap... 🔥</h2></div>";

    const prompt = `Songs listened: ${history.slice(-10).join(", ")}. 
    Create a witty, desi musical recap for Sourav from GBN Polytechnic. 
    Tell him his vibe in 2-3 sentences. Keep it Hinglish.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await res.json();
    resultsDiv.innerHTML = `<div class='welcome-box'><h1>🔥 Your Recap</h1><p>${data.candidates[0].content.parts[0].text}</p></div>`;
}

// --- MATRIX & CONTROLS ---
function startMatrixEffect() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    function draw() {
        if (!isMatrixOn) return;
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = window.matrixColor; ctx.font = "15px monospace";
        for (let i = 0; i < 40; i++) {
            ctx.fillText(Math.floor(Math.random()*10), Math.random()*canvas.width, Math.random()*canvas.height);
        }
        requestAnimationFrame(draw);
    }
    draw();
}

document.getElementById("matrixToggle").onclick = function() {
    isMatrixOn = !isMatrixOn;
    this.classList.toggle('on');
    document.getElementById("matrixCanvas").style.display = isMatrixOn ? "block" : "none";
    if (isMatrixOn) startMatrixEffect();
};

document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
    isMatrixOn = false;
    player.stopVideo();
};
