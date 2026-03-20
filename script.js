// --- 1. CONFIG & API KEYS ---
const YOUTUBE_API_KEY = "AIzaSyDU1MC8SVdTJxBYtB5nQastJD7h7D5jyzg";
const GEMINI_API_KEY = "AIzaSyC0KhWuivkNagpPhVhqqPKZJZZvnOc-DDI";

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
        height: '100%',
        width: '100%',
        videoId: '',
        playerVars: { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
            onStateChange: (e) => {
                if (e.data == 1 && isMatrixOn) startMatrixEffect();
            }
        }
    });
}

// --- 3. GEMINI SMART SEARCH ---
async function askGemini() {
    const input = document.getElementById("searchInput").value.trim();
    if (!input) return;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>Designing your vibe... 🪄</h2></div>";

    try {
        const prompt = `User vibe: "${input}". Suggest best YouTube search (song + artist) and neon color.

Return ONLY valid JSON:
{"search":"song artist","color":"#hexcode"}`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await res.json();
        console.log("Gemini:", data);

        let text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) throw new Error("Empty response");

        text = text.replace(/```json|```/g, "").trim();

        let aiResponse = JSON.parse(text);

        document.documentElement.style.setProperty('--accent', aiResponse.color);
        window.matrixColor = aiResponse.color;

        document.getElementById("searchInput").value = aiResponse.search;

        searchYT();

    } catch (e) {
        console.error(e);
        searchYT(); // fallback
    }
}

// --- 4. YOUTUBE SEARCH ---
async function searchYT() {
    const q = document.getElementById("searchInput").value;
    if (!q) return;

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<p style='text-align:center; padding:50px;'>Loading songs... 🚀</p>";

    try {
        const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
        const data = await res.json();

        resultsDiv.innerHTML = "";

        data.items.forEach(item => {
            const div = document.createElement("div");
            div.className = "card";

            div.innerHTML = `
                <img src="${item.snippet.thumbnails.medium.url}">
                <div style="padding:15px; font-size:12px; font-weight:bold;">
                    ${item.snippet.title}
                </div>
            `;

            div.onclick = () => {
                player.loadVideoById(item.id.videoId);
                document.getElementById("player").classList.add("visible");
                document.getElementById("videoOverlay").classList.add("active");

                listenHistory.push({
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    time: Date.now()
});
                localStorage.setItem('streamflow_history', JSON.stringify(listenHistory));
            };

            resultsDiv.appendChild(div);
        });

    } catch (e) {
        resultsDiv.innerHTML = "<p style='color:red;'>YouTube API limit reached!</p>";
    }
}

// --- 5. GEMINI RECAP (FIXED + FALLBACK) ---
async function generateRecap() {
    document.getElementById("sidebar").classList.remove("show");

    const history = JSON.parse(localStorage.getItem('streamflow_history')) || [];

    if (history.length < 2) {
        alert("Listen to at least 2 songs first!");
        return;
    }

    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = "<div class='welcome-box'><h2>🔥 Creating your vibe report...</h2></div>";

    const prompt = `
Songs: ${history.slice(-10).join(", ")}

Create a cool English recap:
- Music taste
- Personality
- Give nickname
Max 2 lines.
`;

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await res.json();
        console.log("Recap:", data);

        let recapText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        // 🔥 fallback (always show something)
        if (!recapText) {
            recapText = "You're a music explorer 🎧 — mixing chill, hype, and attitude like a true vibe master.";
        }

        resultsDiv.innerHTML = `
            <div class='welcome-box' style='border: 2px solid var(--accent);'>
                <h1 style='color: var(--accent);'>🔥 Your Vibe Recap</h1>
                <p style='font-size: 18px;'>${recapText}</p>
                <button onclick="location.reload()" style="
                    margin-top:20px;
                    padding:10px 20px;
                    border-radius:20px;
                    border:none;
                    background:var(--accent);
                    color:#000;
                    font-weight:bold;
                    cursor:pointer;">
                    Back
                </button>
            </div>
        `;

    } catch (e) {
        console.error(e);

        resultsDiv.innerHTML = `
            <div class='welcome-box'>
                <h2>⚠️ Error</h2>
                <p>Gemini is not responding. Try again later.</p>
            </div>
        `;
    }
}

// --- 6. MATRIX EFFECT ---
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

        for (let i = 0; i < 40; i++) {
            ctx.fillText(
                Math.floor(Math.random() * 10),
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
        }

        requestAnimationFrame(draw);
    }

    draw();
}

// --- 7. UI CONTROLS ---
document.getElementById("menuBtn").onclick = () =>
    document.getElementById("sidebar").classList.toggle("show");

document.getElementById("matrixToggle").onclick = function () {
    const canvas = document.getElementById("matrixCanvas");

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

function generateWrapped() {
    const history = JSON.parse(localStorage.getItem('streamflow_history')) || [];

    if (history.length < 3) {
        alert("Listen to more songs to unlock your Wrapped!");
        return;
    }

    const resultsDiv = document.getElementById("results");

    // --- Stats Calculation ---
    const songCount = {};
    const artistCount = {};

    history.forEach(item => {
        songCount[item.title] = (songCount[item.title] || 0) + 1;
        artistCount[item.channel] = (artistCount[item.channel] || 0) + 1;
    });

    const topSong = Object.keys(songCount).sort((a,b) => songCount[b] - songCount[a])[0];
    const topArtist = Object.keys(artistCount).sort((a,b) => artistCount[b] - artistCount[a])[0];
    const totalPlays = history.length;

    const repeatSong = Object.keys(songCount).find(song => songCount[song] > 2) || "No heavy repeat yet";

    // --- Personality Logic ---
    let personality = "";

    if (totalPlays > 20) {
        personality = "🎧 Hardcore Listener – music is your daily fuel.";
    } else if (totalPlays > 10) {
        personality = "🔥 Vibe Explorer – you love switching moods.";
    } else {
        personality = "😎 Casual Listener – chill and selective.";
    }

    // --- UI Output ---
    resultsDiv.innerHTML = `
        <div class='welcome-box' style='border:2px solid var(--accent); text-align:left;'>
            <h1 style="color:var(--accent); text-align:center;">🎧 Your Wrapped</h1>

            <p><b>🎵 Top Song:</b><br>${topSong}</p>
            <p><b>🎤 Top Artist:</b><br>${topArtist}</p>
            <p><b>🔁 Most Replayed:</b><br>${repeatSong}</p>
            <p><b>📊 Total Plays:</b> ${totalPlays}</p>

            <hr style="margin:15px 0; border-color:#333;">

            <p><b>🧠 Your Vibe:</b><br>${personality}</p>

            <button onclick="location.reload()" style="
                margin-top:20px;
                padding:10px 20px;
                border-radius:20px;
                border:none;
                background:var(--accent);
                color:#000;
                font-weight:bold;
                cursor:pointer;">
                Back
            </button>
        </div>
    `;
}
