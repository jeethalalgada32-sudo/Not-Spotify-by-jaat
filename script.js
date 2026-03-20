// --- CONFIG & KEYS ---
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg"; // Teri Original Key
const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI"; // Teri Gemini Key

let player;
let isMatrixOn = false;
window.matrixColor = "#00ff41"; 

// --- 1. YOUTUBE PLAYER SETUP ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api"; // Official API
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'rel': 0, 'modestbranding': 1 },
        events: { 
            'onStateChange': (e) => { if(e.data == 1 && isMatrixOn) startMatrixEffect(); },
            'onError': (e) => console.log("YT Error: ", e.data)
        }
    });
}

// --- 2. GEMINI AI VIBE-ARCHITECT ---
async function askGemini() {
    const input = document.getElementById("searchInput").value.trim();
    if (!input) return;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>Gemini is designing your vibe... 🪄</h2></div>";

    try {
        const prompt = `User vibe: "${input}". 
        1. Suggest the one best YouTube search term (Song + Artist).
        2. Pick a neon hex color code for this vibe.
        Return ONLY JSON: {"search": "...", "color": "..."}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await res.json();
        const cleanText = data.candidates[0].content.parts[0].text.replace(/```json|```/g, "");
        const aiResponse = JSON.parse(cleanText);

        // Apply AI Mood Effects
        document.documentElement.style.setProperty('--accent', aiResponse.color);
        window.matrixColor = aiResponse.color;
        document.getElementById("searchInput").value = aiResponse.search;
        
        // Call YouTube Search
        searchYT(); 

    } catch (e) {
        console.error("Gemini Error:", e);
        searchYT(); // Fallback to normal search
    }
}

// --- 3. YOUTUBE SEARCH LOGIC ---
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    if (!q) return;
    
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center; padding:50px;'>Summoning tracks... 🚀</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        resultsDiv.innerHTML = "";

        if (!data.items || data.items.length === 0) {
            resultsDiv.innerHTML = "<p>No vibes found. Try another search!</p>";
            return;
        }

        data.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `
                <img src="${item.snippet.thumbnails.medium.url}">
                <div style="padding:15px; font-size:13px; font-weight:bold;">${item.snippet.title}</div>
            `;
            div.onclick = () => {
                player.loadVideoById(item.id.videoId);
                document.getElementById("videoOverlay").classList.add("active");
                document.getElementById("nowPlaying").innerText = "Vibing: " + item.snippet.title;
            };
            resultsDiv.appendChild(div);
        });
    } catch (e) {
        resultsDiv.innerHTML = "<p style='color:red;'>YouTube API limit reached. Try again later!</p>";
    }
}

// --- 4. MATRIX ANIMATION ---
function startMatrixEffect() {
    const canvas = document.getElementById('matrixCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function draw() {
        if (!isMatrixOn) return;
        ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = window.matrixColor; 
        ctx.font = "15px monospace";

        for (let i = 0; i < 50; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            if (Math.random() > 0.9) ctx.fillText(Math.floor(Math.random()*10), x, y);
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// --- 5. UI CONTROLS ---
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
