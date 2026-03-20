// --- 1. CONFIG & API KEYS ---
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI"; // Teri Gemini Key

let player;
let isMatrixOn = false;
const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const chars = "01STREAMFLOWMATRIXSOURAV"; //

// --- 2. SIDEBAR LOGIC ---
document.getElementById("menuBtn").onclick = () => document.getElementById("sidebar").classList.toggle("show");

// --- 3. YOUTUBE API SETUP ---
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api"; 
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '100%', width: '100%', videoId: '',
        playerVars: { 'autoplay': 1, 'playsinline': 1, 'rel': 0, 'modestbranding': 1 },
        events: { 'onStateChange': (e) => { if(e.data == 1 && isMatrixOn) startMatrixEffect(); } }
    });
}

// --- 4. GEMINI AI SMART SEARCH ---
async function askGemini() {
    const userInput = document.getElementById("searchInput").value.trim();
    if (!userInput) return;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center; padding:20px;'>Gemini is finding your vibe... 🪄</p>";

    try {
        // Gemini Prompt for Song Suggestion
        const prompt = `User vibe: "${userInput}". Suggest the ONE best YouTube search term (Song Name + Artist). Return ONLY the search text.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();
        const aiSuggestion = data.candidates[0].content.parts[0].text.trim();
        
        // AI ki suggestion ko YouTube search mein bhej rahe hain
        document.getElementById("searchInput").value = aiSuggestion;
        searchYT(); 

    } catch (error) {
        console.error("Gemini Error:", error);
        searchYT(); // Fallback to normal search if AI fails
    }
}

// --- 5. SEARCH LOGIC (YouTube) ---
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center; padding:20px;'>Fetching videos... 🚀</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();
        resultsDiv.innerHTML = "";

        data.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<img src="${item.snippet.thumbnails.medium.url}"><div style="padding:10px; font-size:12px; text-align:center;">${item.snippet.title}</div>`;
            div.onclick = () => {
                player.loadVideoById(item.id.videoId);
                document.getElementById("videoOverlay").classList.add("active");
            };
            resultsDiv.appendChild(div);
        });
    } catch (e) { resultsDiv.innerHTML = "<p style='color:red;'>Quota Limit Reached!</p>"; }
}

// --- 6. SMART MATRIX SIMULATION ---
function startMatrixEffect() {
    if (!isMatrixOn) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    function draw() {
        if (!isMatrixOn) return;
        ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "14px monospace";
        const step = 18;

        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));

                if (dist < 300) { 
                    ctx.fillStyle = "#00ff41";
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
                } else if (Math.random() > 0.98) {
                    ctx.fillStyle = "rgba(0, 255, 65, 0.2)";
                    ctx.fillText("0", x, y);
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

// --- 7. CONTROLS ---
document.getElementById("matrixToggle").onclick = function() {
    isMatrixOn = !isMatrixOn;
    this.classList.toggle('on');
    this.innerText = isMatrixOn ? "AI Matrix: ON" : "AI Matrix: OFF";
    canvas.style.display = isMatrixOn ? "block" : "none";
    if (isMatrixOn) startMatrixEffect();
};

document.getElementById("closeBtn").onclick = () => {
    document.getElementById("videoOverlay").classList.remove("active");
    isMatrixOn = false;
    player.stopVideo();
};
                     
