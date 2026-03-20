// --- 1. CONFIG & API KEYS ---
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI"; //

let player;
let isMatrixOn = false;
let listenHistory = JSON.parse(localStorage.getItem('streamflow_history')) || [];
window.matrixColor = "#00f2ff"; 

// --- 2. YOUTUBE PLAYER SETUP ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api"; 
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'rel': 0, 'modestbranding': 1 },
        events: { 
            'onStateChange': (e) => { if(e.data == 1 && isMatrixOn) startMatrixEffect(); }
        }
    });
}

// --- 3. GEMINI SMART SEARCH & VIBE ---
async function askGemini() {
    const input = document.getElementById("searchInput").value.trim();
    if (!input) return;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>Gemini is designing your vibe... 🪄</h2></div>";

    try {
        const prompt = `User vibe: "${input}". Suggest the one best YouTube search term (Song Name + Artist). Pick a neon hex color code for this vibe. Return ONLY JSON: {"search": "...", "color": "..."}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const cleanText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        const aiResponse = JSON.parse(cleanText);

        document.documentElement.style.setProperty('--accent', aiResponse.color);
        window.matrixColor = aiResponse.color;
        document.getElementById("searchInput").value = aiResponse.search;
        searchYT(); 

    } catch (e) {
        console.error("Gemini Error:", e);
        searchYT(); 
    }
}

// --- 4. YOUTUBE SEARCH LOGIC ---
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    if (!q) return;
    
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center; padding:50px;'>Summoning tracks... 🚀</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        resultsDiv.innerHTML = "";

        data.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><div style="padding:15px; font-size:12px; font-weight:bold;">${item.snippet.title}</div>`;
            div.onclick = () => {
                player.loadVideoById(item.id.videoId);
                document.getElementById("player").classList.add("visible");
                document.getElementById("videoOverlay").classList.add("active");
                
                // History Save for Recap
                listenHistory.push(item.snippet.title);
                localStorage.setItem('streamflow_history', JSON.stringify(listenHistory));
            };
            resultsDiv.appendChild(div);
        });
    } catch (e) {
        resultsDiv.innerHTML = "<p style='color:red;'>YouTube API limit reached!</p>";
    }
}

// --- 5. GEMINI RECAP FEATURE ---
async function generateRecap() {
    document.getElementById("sidebar").classList.remove("show");
    const history = JSON.parse(localStorage.getItem('streamflow_history')) || [];
    
    if (history.length < 2) {
        alert("Bhai, kam se kam 2-3 gaane suno recap ke liye!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>🔥 Crafting your Vibe Report...</h2></div>";

    const prompt = `Songs: ${history.slice(-10).join(", ")}. Create a witty Hinglish recap for Sourav from GBN Polytechnic. Analyze his vibe and tell him his musical personality in 2 sentences.`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const recapText = data.candidates[0].content.parts[0].text;
        
        resultsDiv.innerHTML = `
            <div class='welcome-box' style='border: 2px solid var(--accent);'>
                <h1 style='color: var(--accent);'>🔥 Your Vibe Recap</h1>
                <p style='font-size: 18px;'>${recapText}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:10px 20px; border-radius:20px; border:none; background:var(--accent); color:#000; font-weight:bold; cursor:pointer;">Back to Dashboard</button>
            </div>`;
    } catch (e) {
        resultsDiv.innerHTML = "<div class='welcome-box'><h2>Gemini is a bit busy. Try again!</h2></div>";
    }
}

// --- 6. MATRIX & UI CONTROLS ---
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

document.getElementById("menuBtn").onclick = () => document.getElementById("sidebar").classList.toggle("show");
document.getElementById("matrixToggle").onclick = function() {
    isMatrixOn = !isMatrixOn;
    this.classList.toggle('on');
    canvas.style.display = isMatrixOn ? "block" : "none";
    if (isMatrixOn) startMatrixEffect();
};
document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
    isMatrixOn = false;
    player.stopVideo();
};
